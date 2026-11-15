import type { ComponentType, SVGProps } from "react";
import { ConceptsFolderIcon, EncryptionIcon, LockIcon, NmapIcon, ToolsFolderIcon, VpnIcon, WifiIcon } from "../icons/DesktopIcons";

export type FolderItem = {
  id: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
  // Locked items only print a hint when opened
  lockedMessage?: string;
};

export type Folder = {
  id: string;
  label: string;
  path: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: FolderItem[];
};

export const cyberTools: Folder = {
  id: "cyber-tools",
  label: "cyber-tools",
  path: "/home/friday/cyber-tools",
  Icon: ToolsFolderIcon,
  items: [
    { id: "nmap", label: "nMap", Icon: NmapIcon, description: "network mapper · finds devices and open ports" },
    {
      id: "wireshark",
      label: "wireshark",
      Icon: LockIcon,
      description: "packet sniffer",
      lockedMessage: "wireshark is locked. ramesh will unlock it in a later chapter.",
    },
    {
      id: "hydra",
      label: "hydra",
      Icon: LockIcon,
      description: "password tester",
      lockedMessage: "hydra is locked. 'first learn to knock, then learn to pick locks.' - ramesh",
    },
    {
      id: "metasploit",
      label: "metasploit",
      Icon: LockIcon,
      description: "exploit framework",
      lockedMessage: "metasploit is locked. friday is not ready for this one yet.",
    },
  ],
};

export const cyberConcepts: Folder = {
  id: "cyber-concepts",
  label: "cyber-concepts",
  path: "/home/friday/cyber-concepts",
  Icon: ConceptsFolderIcon,
  items: [
    { id: "encryption", label: "encryption", Icon: EncryptionIcon, description: "how secrets survive the internet · http -> https" },
    { id: "wifi", label: "wifi passwords", Icon: WifiIcon, description: "how weak wi-fi gets cracked · aircrack-ng story" },
    {
      id: "hashing",
      label: "hashing",
      Icon: LockIcon,
      description: "how sites store passwords without knowing them",
      lockedMessage: "hashing is locked. finish encryption first, it's the next concept.",
    },
    { id: "vpn", label: "vpn", Icon: VpnIcon, description: "encrypted tunnels · what they hide and what they don't" },
    {
      id: "firewalls",
      label: "firewalls",
      Icon: LockIcon,
      description: "deciding who gets in",
      lockedMessage: "firewalls is locked. coming soon.",
    },
  ],
};
