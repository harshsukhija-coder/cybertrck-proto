import type { Project } from "../project";
import { tryHarderProject } from "./try-harder";

export const projects: Project[] = [tryHarderProject];

export const projectById = (id: string) => projects.find(project => project.id === id);

export { tryHarderProject };
