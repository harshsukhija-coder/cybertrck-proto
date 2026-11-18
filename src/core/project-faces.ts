import attackerFace from "../assets/faces/attacker.jpg";
import botFace from "../assets/faces/bot.jpg";
import narratorFace from "../assets/faces/narrator.jpg";
import scriptFace from "../assets/faces/script.jpg";
import targetFace from "../assets/faces/target.jpg";

export type CastWho = "narrator" | "target" | "attacker" | "bot" | "script";

export const cast: Record<
  CastWho,
  { label: string; color: string; bg: string; face: string }
> = {
  narrator: { label: "narrator", color: "#ffd23f", bg: "rgba(255,210,63,0.14)", face: narratorFace },
  target: { label: "Target", color: "#3ddc84", bg: "rgba(61,220,132,0.12)", face: targetFace },
  attacker: { label: "Attacker", color: "#ff5d73", bg: "rgba(255,93,115,0.12)", face: attackerFace },
  bot: { label: "random bot", color: "#ff8a3d", bg: "rgba(255,138,61,0.12)", face: botFace },
  script: { label: "try-harder.py", color: "#a78bfa", bg: "rgba(167,139,250,0.14)", face: scriptFace },
};
