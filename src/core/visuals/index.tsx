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
};

const Visual = ({ name }: { name: VisualKey }) => {
  const Component = visuals[name];
  return <Component />;
};

export default Visual;
