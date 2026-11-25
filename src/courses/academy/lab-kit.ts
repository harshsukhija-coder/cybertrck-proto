import { ipToInt, isEndDevice, type Device, type PtNetwork } from "./pt-network";
import type { LabContext } from "./types";

const same = (a = "", b = "") => a.trim().toLowerCase() === b.trim().toLowerCase();
const norm = (port: string) => port.toLowerCase().replace(/\s+/g, "");

/** A router/switch by its configured hostname, falling back to its name on the canvas */
export const deviceNamed = (net: PtNetwork, name: string) =>
  net.devices.find(d => same(d.hostname, name)) ?? net.devices.find(d => same(d.name, name));

export const hostWithIp = (net: PtNetwork, ip: string) => net.devices.find(d => d.host && !d.host.dhcp && d.host.ip === ip);

export const ipToIntSafe = (ip: string) => ipToInt(ip) ?? -1;

export const endDevices = (net: PtNetwork) => net.devices.filter(isEndDevice);

export const ifaceWithIp = (d: Device | undefined, ip: string) => d?.interfaces.find(i => i.ip === ip);

/** Lines under a top-level config line, e.g. section(r, /^line vty/) */
export const section = (d: Device | undefined, header: RegExp) => {
  const out: string[] = [];
  let inside = false;
  for (const raw of d?.config ?? []) {
    if (!/^\s/.test(raw)) inside = header.test(raw.trim());
    else if (inside) out.push(raw.trim());
  }
  return out;
};

export const hasLine = (d: Device | undefined, re: RegExp) => !!d?.config.some(l => re.test(l.trim()));

/** The switch port a device is cabled to, if any */
export const switchPortOf = (net: PtNetwork, d: Device) => {
  for (const link of net.links) {
    const [mine, other, otherPort] =
      link.from === d.ref ? [link.fromPort, link.to, link.toPort] : link.to === d.ref ? [link.toPort, link.from, link.fromPort] : [];
    if (!mine || !other) continue;
    const sw = net.devices.find(x => x.ref === other && x.kind === "switch");
    if (sw) return { sw, port: otherPort ?? "", iface: sw.interfaces.find(i => norm(i.name) === norm(otherPort ?? "")) };
  }
  return undefined;
};

export const isCabledTo = (net: PtNetwork, a: Device, b: Device) =>
  net.links.some(l => (l.from === a.ref && l.to === b.ref) || (l.from === b.ref && l.to === a.ref));

// ---------- ready-made checks ----------

export const need = (found: unknown, message: string): true | string => (found ? true : message);

export const pcAt = (ip: string, mask: string, gateway?: string) => (ctx: LabContext) => {
  const pc = hostWithIp(ctx.net, ip);
  if (!pc?.host) return `no PC uses ${ip}. open the PC → Desktop → IP Configuration`;
  if (pc.host.mask !== mask) return `${pc.name} has mask ${pc.host.mask || "(empty)"}, it should be ${mask}`;
  if (gateway && pc.host.gateway !== gateway) return `${pc.name}'s default gateway is ${pc.host.gateway || "(empty)"}, it should be ${gateway}`;
  return true;
};

export const pingBetween = (ipA: string, ipB: string) => (ctx: LabContext) => {
  const a = hostWithIp(ctx.net, ipA);
  const b = hostWithIp(ctx.net, ipB);
  if (!a || !b) return `couldn't find both PCs (${ipA} and ${ipB})`;
  const result = ctx.sim.ping(a, b);
  return result.ok ? true : result.reason;
};

export const routerIface = (host: string, ip: string, mask: string) => (ctx: LabContext) => {
  const r = deviceNamed(ctx.net, host);
  if (!r) return `no router called ${host}. use the command: hostname ${host}`;
  const i = ifaceWithIp(r, ip);
  if (!i) return `${host} has no interface with ${ip}`;
  if (i.mask !== mask) return `${host} ${i.name} has mask ${i.mask}, it should be ${mask}`;
  if (i.shutdown) return `${host} ${i.name} is shut down. run "no shutdown" on it`;
  return true;
};

export const staticRoute = (host: string, network: string, mask: string) => (ctx: LabContext) => {
  const r = deviceNamed(ctx.net, host);
  if (!r) return `no router called ${host}`;
  return need(
    r.routes.some(x => (x.network === network && x.mask === mask) || x.mask === "0.0.0.0"),
    `${host} has no route for ${network} ${mask}. add: ip route ${network} ${mask} <next hop>`,
  );
};
