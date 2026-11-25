import { decodePacketTracer } from "./pt-decode";
import { buildSimulator, readNetwork } from "./pt-network";
import { LAB_PASS, type Lab } from "./types";

export type CheckResult = { label: string; points: number; ok: boolean; reason?: string; hint: string };

export type Grade = {
  score: number;
  passed: boolean;
  results: CheckResult[];
  version: string;
  devices: { name: string; kind: string }[];
  cables: number;
};

export const gradeLab = async (lab: Lab, bytes: Uint8Array): Promise<Grade> => {
  const xml = await decodePacketTracer(bytes);
  const net = readNetwork(xml);
  const sim = buildSimulator(net);

  const results = lab.checks.map(check => {
    let outcome: true | string;
    try {
      outcome = check.run({ net, sim });
    } catch (error) {
      outcome = error instanceof Error ? error.message : "this check crashed";
    }
    return { label: check.label, points: check.points, hint: check.hint, ok: outcome === true, reason: outcome === true ? undefined : outcome };
  });

  const total = results.reduce((sum, r) => sum + r.points, 0);
  const earned = results.reduce((sum, r) => sum + (r.ok ? r.points : 0), 0);
  const score = Math.round((earned / total) * 100);

  return {
    score,
    passed: score >= LAB_PASS,
    results,
    version: net.version,
    devices: net.devices.filter(d => d.kind !== "other").map(d => ({ name: d.hostname && d.kind !== "pc" ? d.hostname : d.name, kind: d.kind })),
    cables: net.links.length,
  };
};
