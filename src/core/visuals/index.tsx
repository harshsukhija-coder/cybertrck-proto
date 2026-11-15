import type { VisualKey } from "../story";
import { DevicesFound, IpAnatomy, WhoIsWho } from "./discovery-visuals";
import {
  CaesarCrack,
  CaesarWheel,
  EncryptFlow,
  HttpsHandshake,
  HttpVsHttps,
  InternetPath,
  KeyExchangeProblem,
  KeyPair,
  KeySpace,
  PadlockBox,
  SessionKeys,
  SpeedRace,
  SymmetricFlow,
  WiresharkHttp,
  WiresharkTls,
} from "./encryption-visuals";
import { Broadcast, NetworkDiagram, OfficeNetwork, PacketJourney } from "./network-visuals";
import { Handshake, OsFingerprint, PortCoverage, PortDoors, ReconPipeline } from "./scan-visuals";
import {
  AirodumpScan,
  DeauthKick,
  HandshakeCaught,
  MonitorMode,
  RockyouCrack,
  SmarterNeighbor,
  TargetLock,
  WifiDefense,
  WifiHandshake,
} from "./wifi-visuals";
import {
  GlassVsPipe,
  IpMask,
  TrafficLeaks,
  VpnLimits,
  VpnRecap,
  VpnTunnelFlow,
  VpnVsProxy,
} from "./vpn-visuals";

const visuals: Record<VisualKey, () => React.JSX.Element> = {
  "office-network": OfficeNetwork,
  "ip-anatomy": IpAnatomy,
  "packet-journey": PacketJourney,
  broadcast: Broadcast,
  "who-is-who": WhoIsWho,
  "devices-found": DevicesFound,
  "network-diagram": NetworkDiagram,
  "port-doors": PortDoors,
  handshake: Handshake,
  "port-coverage": PortCoverage,
  "os-fingerprint": OsFingerprint,
  "recon-pipeline": ReconPipeline,
  "http-vs-https": HttpVsHttps,
  "internet-path": InternetPath,
  "wireshark-http": WiresharkHttp,
  "wireshark-tls": WiresharkTls,
  "encrypt-flow": EncryptFlow,
  "caesar-wheel": CaesarWheel,
  "caesar-crack": CaesarCrack,
  "key-space": KeySpace,
  "symmetric-flow": SymmetricFlow,
  "key-exchange-problem": KeyExchangeProblem,
  "key-pair": KeyPair,
  "padlock-box": PadlockBox,
  "speed-race": SpeedRace,
  "https-handshake": HttpsHandshake,
  "session-keys": SessionKeys,
  "wifi-handshake": WifiHandshake,
  "monitor-mode": MonitorMode,
  "airodump-scan": AirodumpScan,
  "target-lock": TargetLock,
  "deauth-kick": DeauthKick,
  "handshake-caught": HandshakeCaught,
  "rockyou-crack": RockyouCrack,
  "wifi-defense": WifiDefense,
  "smarter-neighbor": SmarterNeighbor,
  "traffic-leaks": TrafficLeaks,
  "glass-vs-pipe": GlassVsPipe,
  "vpn-tunnel-flow": VpnTunnelFlow,
  "ip-mask": IpMask,
  "vpn-limits": VpnLimits,
  "vpn-vs-proxy": VpnVsProxy,
  "vpn-recap": VpnRecap,
};

const Visual = ({ name }: { name: VisualKey }) => {
  const Component = visuals[name];
  return <Component />;
};

export default Visual;
