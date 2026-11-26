import { encryptionCourse, firewallCourse, mitmCourse, nmapCourse, trojanCourse, vpnCourse, wifiCourse } from "../core/courses";

/** The story missions from the classic desktop */
export const MISSIONS = [nmapCourse, encryptionCourse, wifiCourse, vpnCourse, firewallCourse, mitmCourse, trojanCourse];

export const findMission = (id: string) => MISSIONS.find(m => m.id === id || m.moduleName === id);
