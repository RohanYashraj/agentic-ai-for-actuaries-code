/** Agent scripts runnable on the server.
 *
 * Generated from server/registry.py (the enforcement point — it only
 * runs ids it knows) by scripts/export_registry.py, which the predev
 * and prebuild hooks invoke. Do not edit agents.generated.json by
 * hand: change the registry and regenerate.
 */
import generated from "./agents.generated.json";

export interface AgentEntry {
  id: string;
  chapterDir: string;
  script: string;
  title: string;
  description: string;
  estSeconds: number;
  runnable: boolean;
  reason?: string;
}

export const AGENT_SCRIPTS: AgentEntry[] = generated as AgentEntry[];

export function agentsForChapter(chapter: string): AgentEntry[] {
  return AGENT_SCRIPTS.filter((a) => a.chapterDir.startsWith(chapter));
}
