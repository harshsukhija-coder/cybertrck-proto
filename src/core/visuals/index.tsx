import type { VisualKey } from "../story";
import { DevicesFound, IpAnatomy, WhoIsWho } from "./discovery-visuals";
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
};

const Visual = ({ name }: { name: VisualKey }) => {
  const Component = visuals[name];
  return <Component />;
};

export default Visual;
