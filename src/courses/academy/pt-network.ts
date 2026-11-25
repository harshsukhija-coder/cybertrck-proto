/**
 * Turns decoded Packet Tracer XML into a small network model, parses the Cisco IOS
 * running-configs inside it, and simulates pings between devices.
 */

// ---------- tiny XML tree ----------

export type XmlNode = { tag: string; attrs: Record<string, string>; children: XmlNode[]; text: string };

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
const unescape = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITIES[e] ?? m),
  );

export const parseXml = (xml: string): XmlNode => {
  const root: XmlNode = { tag: "#root", attrs: {}, children: [], text: "" };
  const stack = [root];
  const tagRe = /<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/([^\s>]+)\s*>|<([^\s/>]+)([^>]*?)(\/?)>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(xml))) {
    const top = stack[stack.length - 1];
    if (match.index > last) top.text += unescape(xml.slice(last, match.index));
    last = tagRe.lastIndex;
    const [, cdata, closing, opening, attrText, selfClose] = match;
    if (cdata !== undefined) top.text += cdata;
    else if (closing) {
      if (stack.length > 1) stack.pop();
    } else if (opening) {
      const attrs: Record<string, string> = {};
      for (const a of attrText.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = unescape(a[2]);
      const node: XmlNode = { tag: opening, attrs, children: [], text: "" };
      top.children.push(node);
      if (!selfClose) stack.push(node);
    }
  }
  return root;
};

const child = (node: XmlNode | undefined, tag: string) => node?.children.find(c => c.tag === tag);
const childText = (node: XmlNode | undefined, tag: string) => child(node, tag)?.text.trim() ?? "";
const findAll = (node: XmlNode, tag: string, out: XmlNode[] = []) => {
  for (const c of node.children) {
    if (c.tag === tag) out.push(c);
    else findAll(c, tag, out);
  }
  return out;
};

// ---------- model ----------

export type DeviceKind = "pc" | "server" | "laptop" | "router" | "switch" | "hub" | "other";

export type HostPort = { ip: string; mask: string; gateway: string; dhcp: boolean };

export type IosInterface = {
  name: string;
  ip?: string;
  mask?: string;
  shutdown: boolean;
  description?: string;
  mode?: "access" | "trunk";
  accessVlan?: number;
  allowedVlans?: number[];
  dot1q?: number;
  native?: boolean;
  lines: string[];
};

export type DhcpPool = { name: string; network?: string; mask?: string; defaultRouter?: string; dns?: string };

export type StaticRoute = { network: string; mask: string; via: string };

export type Device = {
  ref: string;
  name: string;
  type: string;
  model: string;
  kind: DeviceKind;
  on: boolean;
  config: string[];
  hostname?: string;
  interfaces: IosInterface[];
  routes: StaticRoute[];
  dhcpPools: DhcpPool[];
  excluded: [string, string][];
  vlans: { number: number; name: string }[];
  host?: HostPort;
};

export type Link = { from: string; fromPort: string; to: string; toPort: string; cable: string; working: boolean };

export type PtNetwork = { version: string; devices: Device[]; links: Link[] };

const kindOf = (type: string): DeviceKind => {
  const t = type.toLowerCase();
  if (t === "pc") return "pc";
  if (t === "laptop") return "laptop";
  if (t === "server") return "server";
  if (t === "router") return "router";
  if (t === "switch" || t === "multilayerswitch") return "switch";
  if (t === "hub" || t === "repeater") return "hub";
  return "other";
};

export const isEndDevice = (d: Device) => d.kind === "pc" || d.kind === "laptop" || d.kind === "server";

const parseVlanList = (text: string) =>
  text.split(",").flatMap(part => {
    const [a, b] = part.split("-").map(Number);
    if (Number.isNaN(a)) return [];
    if (b === undefined || Number.isNaN(b)) return [a];
    return Array.from({ length: Math.min(b - a + 1, 4096) }, (_, i) => a + i);
  });

/** Splits a running-config into interfaces, routes, DHCP pools and global lines */
export const parseIos = (lines: string[]) => {
  const interfaces: IosInterface[] = [];
  const routes: StaticRoute[] = [];
  const dhcpPools: DhcpPool[] = [];
  const excluded: [string, string][] = [];
  let hostname: string | undefined;
  let iface: IosInterface | null = null;
  let pool: DhcpPool | null = null;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const indented = /^\s/.test(line);
    const words = line.trim().split(/\s+/);
    if (!indented) {
      iface = null;
      pool = null;
    }

    if (!indented && words[0] === "interface") {
      iface = { name: words.slice(1).join(""), shutdown: false, lines: [] };
      interfaces.push(iface);
      continue;
    }
    if (!indented && words[0] === "ip" && words[1] === "dhcp" && words[2] === "pool") {
      pool = { name: words.slice(3).join(" ") };
      dhcpPools.push(pool);
      continue;
    }
    if (!indented && words[0] === "hostname") hostname = words[1];
    if (!indented && words[0] === "ip" && words[1] === "route" && words.length >= 5) {
      routes.push({ network: words[2], mask: words[3], via: words[4] });
    }
    if (!indented && words[0] === "ip" && words[1] === "dhcp" && words[2] === "excluded-address") {
      excluded.push([words[3], words[4] ?? words[3]]);
    }

    if (iface && indented) {
      const l = line.trim();
      iface.lines.push(l);
      if (l === "shutdown") iface.shutdown = true;
      else if (words[0] === "ip" && words[1] === "address" && words[2] && words[2] !== "dhcp") {
        iface.ip = words[2];
        iface.mask = words[3];
      } else if (words[0] === "description") iface.description = words.slice(1).join(" ");
      else if (words[0] === "switchport" && words[1] === "mode") iface.mode = words[2] === "trunk" ? "trunk" : "access";
      else if (words[0] === "switchport" && words[1] === "access" && words[2] === "vlan") iface.accessVlan = Number(words[3]);
      else if (words[0] === "switchport" && words[1] === "trunk" && words[2] === "allowed" && words[3] === "vlan") {
        iface.allowedVlans = parseVlanList(words.slice(4).join(""));
      } else if (words[0] === "encapsulation" && /^dot1q$/i.test(words[1] ?? "")) {
        iface.dot1q = Number(words[2]);
        iface.native = words[3] === "native";
      }
    }
    if (pool && indented) {
      if (words[0] === "network") {
        pool.network = words[1];
        pool.mask = words[2];
      } else if (words[0] === "default-router") pool.defaultRouter = words[1];
      else if (words[0] === "dns-server") pool.dns = words[1];
    }
  }
  return { hostname, interfaces, routes, dhcpPools, excluded };
};

const hostPortOf = (engine: XmlNode): HostPort | undefined => {
  const ports = findAll(engine, "PORT").filter(p => child(p, "IP") || child(p, "PORT_DHCP_ENABLE"));
  const port = ports.find(p => childText(p, "IP")) ?? ports[0];
  if (!port) return undefined;
  return {
    ip: childText(port, "IP"),
    mask: childText(port, "SUBNET"),
    gateway: childText(port, "PORT_GATEWAY") || childText(port, "GATEWAY") || childText(engine, "GATEWAY"),
    dhcp: childText(port, "PORT_DHCP_ENABLE") === "true",
  };
};

/** Builds the network model from decoded Packet Tracer XML */
export const readNetwork = (xml: string): PtNetwork => {
  const root = parseXml(xml);
  const doc = findAll(root, "PACKETTRACER5")[0];
  const network = child(doc, "NETWORK");
  if (!doc || !network) throw new Error("this file has no network inside it");

  const devices: Device[] = (child(network, "DEVICES")?.children ?? [])
    .filter(d => d.tag === "DEVICE")
    .map((d, index) => {
      const engine = child(d, "ENGINE") ?? d;
      const typeNode = child(engine, "TYPE");
      const type = typeNode?.text.trim() ?? "";
      const config = child(engine, "RUNNINGCONFIG")?.children.filter(c => c.tag === "LINE").map(c => c.text) ?? [];
      const ios = parseIos(config);
      const kind = kindOf(type);
      const vlans = findAll(engine, "VLAN")
        .filter(v => v.attrs.number)
        .map(v => ({ number: Number(v.attrs.number), name: v.attrs.name ?? "" }));
      return {
        ref: childText(engine, "SAVE_REF_ID") || String(index),
        name: childText(engine, "NAME"),
        type,
        model: typeNode?.attrs.model ?? "",
        kind,
        on: childText(engine, "POWER") !== "false",
        config,
        ...ios,
        vlans,
        host: kind === "pc" || kind === "laptop" || kind === "server" ? hostPortOf(engine) : undefined,
      };
    });

  const links: Link[] = (child(network, "LINKS")?.children ?? []).flatMap(link => {
    const cable = child(link, "CABLE");
    if (!cable) return [];
    const ports = cable.children.filter(c => c.tag === "PORT").map(c => c.text.trim());
    return [
      {
        from: childText(cable, "FROM"),
        to: childText(cable, "TO"),
        fromPort: ports[0] ?? "",
        toPort: ports[1] ?? "",
        cable: childText(cable, "TYPE") || childText(link, "TYPE"),
        working: childText(cable, "FUNCTIONAL") !== "false",
      },
    ];
  });

  return { version: childText(doc, "VERSION"), devices, links };
};

// ---------- IP helpers ----------

export const ipToInt = (ip: string) => {
  const parts = ip.trim().split(".").map(Number);
  if (parts.length !== 4 || parts.some(p => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
};

export const sameSubnet = (a: string, b: string, mask: string) => {
  const [x, y, m] = [ipToInt(a), ipToInt(b), ipToInt(mask)];
  return x !== null && y !== null && m !== null && ((x & m) >>> 0) === ((y & m) >>> 0);
};

export const inSubnet = (ip: string, network: string, mask: string) => sameSubnet(ip, network, mask);

const maskBits = (mask: string) => {
  const m = ipToInt(mask);
  return m === null ? -1 : m.toString(2).replace(/0+$/, "").length;
};

// ---------- simulation ----------

const norm = (port: string) => port.toLowerCase().replace(/\s+/g, "");

type L3 = { device: Device; ip: string; mask: string; segment: string; gateway?: string };

export type PingResult = { ok: boolean; reason: string };

/** Works out which devices share a wire/VLAN, then follows gateways and routes like a real ping */
export const buildSimulator = (net: PtNetwork) => {
  const byRef = new Map(net.devices.map(d => [d.ref, d]));
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    const p = parent.get(k);
    if (p === undefined || p === k) {
      parent.set(k, k);
      return k;
    }
    const r = find(p);
    parent.set(k, r);
    return r;
  };
  const union = (a: string, b: string) => parent.set(find(a), find(b));

  const allVlans = new Set<number>([1]);
  for (const d of net.devices) {
    for (const i of d.interfaces) {
      if (i.accessVlan) allVlans.add(i.accessVlan);
      if (i.dot1q) allVlans.add(i.dot1q);
      i.allowedVlans?.forEach(v => v <= 4094 && allVlans.add(v));
    }
    d.vlans.forEach(v => v.number < 1002 && allVlans.add(v.number));
  }

  const iface = (d: Device, port: string) => d.interfaces.find(i => norm(i.name) === norm(port));

  /** Every (segment key, vlan tag) a cable end plugs into */
  const endpoints = (d: Device, port: string): { key: string; tag: number | "u" }[] => {
    if (!d.on) return [];
    if (isEndDevice(d)) return [{ key: `h:${d.ref}`, tag: "u" }];
    if (d.kind === "router") {
      const phys = iface(d, port);
      if (phys?.shutdown) return [];
      const out: { key: string; tag: number | "u" }[] = [];
      if (phys?.ip) out.push({ key: `r:${d.ref}:${norm(phys.name)}`, tag: "u" });
      for (const sub of d.interfaces) {
        if (!norm(sub.name).startsWith(`${norm(port)}.`) || sub.shutdown || !sub.ip) continue;
        out.push({ key: `r:${d.ref}:${norm(sub.name)}`, tag: sub.native ? "u" : (sub.dot1q ?? "u") });
      }
      return out;
    }
    if (d.kind === "switch") {
      const p = iface(d, port);
      if (p?.shutdown) return [];
      if (p?.mode === "trunk") {
        const allowed = p.allowedVlans ? new Set(p.allowedVlans) : allVlans;
        return [{ key: `s:${d.ref}:1`, tag: "u" }, ...[...allowed].filter(v => allVlans.has(v)).map(v => ({ key: `s:${d.ref}:${v}`, tag: v }))];
      }
      return [{ key: `s:${d.ref}:${p?.accessVlan ?? 1}`, tag: "u" }];
    }
    return [{ key: `x:${d.ref}`, tag: "u" }];
  };

  for (const link of net.links) {
    if (!link.working) continue;
    const a = byRef.get(link.from);
    const b = byRef.get(link.to);
    if (!a || !b) continue;
    for (const ea of endpoints(a, link.fromPort)) {
      for (const eb of endpoints(b, link.toPort)) if (ea.tag === eb.tag) union(ea.key, eb.key);
    }
  }

  const connected = new Set(net.links.flatMap(l => (l.working ? [l.from, l.to] : [])));

  const l3: L3[] = [];
  for (const d of net.devices) {
    if (!d.on || d.kind !== "router") continue;
    for (const i of d.interfaces) {
      if (!i.ip || !i.mask || i.shutdown) continue;
      const parentPort = i.name.split(".")[0];
      if (iface(d, parentPort)?.shutdown) continue;
      l3.push({ device: d, ip: i.ip, mask: i.mask, segment: find(`r:${d.ref}:${norm(i.name)}`) });
    }
  }

  /** Packet Tracer doesn't save DHCP leases, so hand them out the way the router would */
  const leases = new Map<Device, { ip: string; mask: string; gateway: string; server: Device }>();
  const used = new Set(net.devices.flatMap(d => (d.host?.ip ? [d.host.ip] : [])));
  l3.forEach(x => used.add(x.ip));
  const lease = (d: Device) => {
    const segment = find(`h:${d.ref}`);
    for (const gw of l3.filter(x => x.segment === segment)) {
      const pool = gw.device.dhcpPools.find(p => p.network && p.mask && inSubnet(gw.ip, p.network, p.mask));
      if (!pool?.network || !pool.mask) continue;
      const net0 = ipToInt(pool.network)! & ipToInt(pool.mask)!;
      const size = (~ipToInt(pool.mask)! >>> 0) + 1;
      const excluded = gw.device.excluded.map(([a, b]) => [ipToInt(a) ?? 0, ipToInt(b) ?? 0]);
      for (let n = 1; n < size - 1; n++) {
        const value = (net0 + n) >>> 0;
        const ip = [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");
        if (used.has(ip) || excluded.some(([a, b]) => value >= a && value <= b)) continue;
        used.add(ip);
        return { ip, mask: pool.mask, gateway: pool.defaultRouter ?? "", server: gw.device };
      }
    }
    return undefined;
  };

  for (const d of net.devices) {
    if (!d.on || !d.host || !connected.has(d.ref)) continue;
    const segment = find(`h:${d.ref}`);
    if (d.host.dhcp) {
      const got = lease(d);
      if (got) {
        leases.set(d, got);
        l3.push({ device: d, ip: got.ip, mask: got.mask, gateway: got.gateway, segment });
      }
    } else if (d.host.ip) {
      l3.push({ device: d, ip: d.host.ip, mask: d.host.mask, gateway: d.host.gateway, segment });
    }
  }

  const onSegment = (segment: string, ip: string) => l3.find(x => x.segment === segment && x.ip === ip);

  const routeFrom = (router: Device, dst: string, ttl: number): PingResult => {
    if (ttl <= 0) return { ok: false, reason: "the packet went round in circles (routing loop)" };
    const name = router.hostname ?? router.name;
    const mine = l3.filter(x => x.device === router);
    if (mine.some(x => x.ip === dst)) return { ok: true, reason: "" };
    const direct = mine.find(x => sameSubnet(x.ip, dst, x.mask));
    if (direct) {
      return onSegment(direct.segment, dst)
        ? { ok: true, reason: "" }
        : { ok: false, reason: `${name} knows the ${dst} network but nothing answers at ${dst}` };
    }
    const route = router.routes
      .filter(r => inSubnet(dst, r.network, r.mask))
      .sort((a, b) => maskBits(b.mask) - maskBits(a.mask))[0];
    if (!route) return { ok: false, reason: `${name} has no route to ${dst}` };

    if (ipToInt(route.via) === null) {
      const exit = mine.find(x => norm(x.device.interfaces.find(i => i.ip === x.ip)?.name ?? "") === norm(route.via));
      const next = exit && l3.find(x => x.segment === exit.segment && x.device !== router && x.device.kind === "router");
      return next ? routeFrom(next.device, dst, ttl - 1) : { ok: false, reason: `${name}'s route via ${route.via} leads nowhere` };
    }
    const exit = mine.find(x => sameSubnet(x.ip, route.via, x.mask));
    const hop = exit && onSegment(exit.segment, route.via);
    if (!hop || hop.device.kind !== "router") return { ok: false, reason: `${name} sends to next hop ${route.via}, but no router answers there` };
    return routeFrom(hop.device, dst, ttl - 1);
  };

  const oneWay = (src: L3, dst: string): PingResult => {
    if (sameSubnet(src.ip, dst, src.mask)) {
      return onSegment(src.segment, dst)
        ? { ok: true, reason: "" }
        : { ok: false, reason: `${src.device.name} and ${dst} are in the same subnet but not connected (check cables and VLANs)` };
    }
    if (!src.gateway || src.gateway === "0.0.0.0") return { ok: false, reason: `${src.device.name} has no default gateway` };
    const gw = onSegment(src.segment, src.gateway);
    if (!gw || gw.device.kind !== "router") return { ok: false, reason: `${src.device.name}'s gateway ${src.gateway} isn't reachable on its network` };
    return routeFrom(gw.device, dst, 16);
  };

  const hostL3 = (d: Device) => l3.find(x => x.device === d);
  const d2seg = (d: Device) => (connected.has(d.ref) && d.on ? find(isEndDevice(d) ? `h:${d.ref}` : `x:${d.ref}`) : undefined);

  /** Ping from one end device to another device (any of its IPs) and back */
  const ping = (from: Device, to: Device): PingResult => {
    const src = hostL3(from);
    if (!src && from.host?.dhcp && connected.has(from.ref)) return { ok: false, reason: `${from.name} asked for an address by DHCP, but no DHCP server answered` };
    if (!src && !from.host?.ip) return { ok: false, reason: `${from.name} has no IP address` };
    if (!src) return { ok: false, reason: `${from.name} isn't cabled to anything` };
    const targets = l3.filter(x => x.device === to);
    if (!targets.length) return { ok: false, reason: `${to.name} has no reachable IP address` };
    let last: PingResult = { ok: false, reason: "" };
    for (const target of targets) {
      const there = oneWay(src, target.ip);
      if (!there.ok) {
        last = there;
        continue;
      }
      const back = isEndDevice(to) ? oneWay(target, src.ip) : routeFrom(to, src.ip, 16);
      if (back.ok) return back;
      last = { ok: false, reason: `the reply can't get back: ${back.reason}` };
    }
    return last;
  };

  return {
    ping,
    /** The address an end device actually ends up with (static or leased) */
    addressOf: (d: Device) => hostL3(d),
    leaseOf: (d: Device) => leases.get(d),
    /** True when two end devices are on the same wire/VLAN */
    sameSegment: (a: Device, b: Device) => {
      const sa = d2seg(a);
      return sa !== undefined && sa === d2seg(b);
    },
  };
};
