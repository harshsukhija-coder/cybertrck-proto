import type { ComponentType, SVGProps } from "react";
import {
  AttacksFolderIcon,
  ConceptsFolderIcon,
  EncryptionIcon,
  FirewallIcon,
  LockIcon,
  MitmIcon,
  NmapIcon,
  ProjectsFolderIcon,
  ToolsFolderIcon,
  TrojanIcon,
  TryHarderIcon,
  VpnIcon,
  WifiIcon,
} from "../icons/DesktopIcons";

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
      lockedMessage: "metasploit is locked. study image trojan in cyber-attacks first.",
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
      Icon: FirewallIcon,
      description: "border guard · ports · rules · default deny",
    },
  ],
};

export const cyberProjects: Folder = {
  id: "cyber-projects",
  label: "cyber-projects",
  path: "/home/friday/cyber-projects",
  Icon: ProjectsFolderIcon,
  items: [
    {
      id: "try-harder",
      label: "try harder firewall",
      Icon: TryHarderIcon,
      description: "Target vs Attacker · decode the terminals",
    },
  ],
};

export const cyberAttacks: Folder = {
  id: "cyber-attacks",
  label: "cyber-attacks",
  path: "/home/friday/cyber-attacks",
  Icon: AttacksFolderIcon,
  items: [
    {
      id: "trojan",
      label: "image trojan",
      Icon: TrojanIcon,
      description: "fake jpeg · reverse shell · social engineering",
    },
    {
      id: "mitm",
      label: "man in the middle",
      Icon: MitmIcon,
      description: "evil twin · arp spoof · silent intercept",
    },
    {
      id: "phishing",
      label: "phishing",
      Icon: LockIcon,
      description: "fake login pages",
      lockedMessage: "phishing is locked. finish man in the middle first.",
    },
    {
      id: "ransomware",
      label: "ransomware",
      Icon: LockIcon,
      description: "files held hostage",
      lockedMessage: "ransomware is locked. coming soon.",
    },
  ],
};
