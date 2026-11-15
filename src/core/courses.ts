import { EncryptionIcon, NmapIcon, WifiIcon } from "../icons/DesktopIcons";
import { encryptionChapterFive } from "./chapters/encryption/chapter-05";
import { encryptionChapterFour } from "./chapters/encryption/chapter-04";
import { encryptionChapterOne } from "./chapters/encryption/chapter-01";
import { encryptionChapterThree } from "./chapters/encryption/chapter-03";
import { encryptionChapterTwo } from "./chapters/encryption/chapter-02";
import { chapterFive } from "./chapters/nmap/chapter-05";
import { chapterFour } from "./chapters/nmap/chapter-04";
import { chapterOne } from "./chapters/nmap/chapter-01";
import { chapterThree } from "./chapters/nmap/chapter-03";
import { chapterTwo } from "./chapters/nmap/chapter-02";
import { wifiChapterFive } from "./chapters/wifi/chapter-05";
import { wifiChapterFour } from "./chapters/wifi/chapter-04";
import { wifiChapterOne } from "./chapters/wifi/chapter-01";
import { wifiChapterThree } from "./chapters/wifi/chapter-03";
import { wifiChapterTwo } from "./chapters/wifi/chapter-02";
import type { Course } from "./story";

export const nmapCourse: Course = {
  id: "nmap",
  title: "nMap",
  badge: "target 192.168.1.0/24",
  moduleName: "nmap",
  Icon: NmapIcon,
  chapters: [chapterOne, chapterTwo, chapterThree, chapterFour, chapterFive],
};

export const encryptionCourse: Course = {
  id: "encryption",
  title: "encryption",
  badge: "channel: untrusted",
  moduleName: "encryption",
  Icon: EncryptionIcon,
  chapters: [encryptionChapterOne, encryptionChapterTwo, encryptionChapterThree, encryptionChapterFour, encryptionChapterFive],
};

export const wifiCourse: Course = {
  id: "wifi",
  title: "wifi passwords",
  badge: "air: wpa2",
  moduleName: "wifi",
  Icon: WifiIcon,
  chapters: [wifiChapterOne, wifiChapterTwo, wifiChapterThree, wifiChapterFour, wifiChapterFive],
};
