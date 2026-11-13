import type { VividColor } from "./palette";

export type DeviceKind = "router" | "laptop" | "printer" | "server" | "nas" | "desktop";

export type OfficeDevice = {
  id: string;
  kind: DeviceKind;
  name: string;
  host: string;
  ip: string;
  mac: string;
  vendor: string;
  color: VividColor;
  note: string;
};

// The chaibyte office network that every chapter scans
export const officeDevices: OfficeDevice[] = [
  { id: "router", kind: "router", name: "netgear router", host: "routerlogin.net", ip: "192.168.1.1", mac: "A0:40:A0:3C:11:02", vendor: "Netgear", color: "yellow", note: "gateway + wifi" },
  { id: "macbook", kind: "laptop", name: "friday's macbook", host: "fridays-macbook", ip: "192.168.1.10", mac: "(this machine)", vendor: "Apple", color: "cyan", note: "that's you" },
  { id: "printer", kind: "printer", name: "hp printer", host: "HPDA41C2", ip: "192.168.1.20", mac: "3C:52:82:DA:41:C2", vendor: "Hewlett Packard", color: "blue", note: "prints. sometimes." },
  { id: "x7q", kind: "server", name: "web server (mysql)", host: "DESKTOP-X7Q", ip: "192.168.1.30", mac: "18:66:DA:2E:7C:91", vendor: "Dell", color: "red", note: "the mystery guest" },
  { id: "nas", kind: "nas", name: "synology nas", host: "chaibyte-nas", ip: "192.168.1.40", mac: "00:11:32:8F:2B:64", vendor: "Synology", color: "purple", note: "file storage" },
  { id: "boss", kind: "laptop", name: "boss's laptop", host: "BOSS-LAPTOP", ip: "192.168.1.50", mac: "F4:5C:89:17:A3:0E", vendor: "Apple", color: "orange", note: "do not touch" },
];
