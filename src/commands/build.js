import { intro, outro, spinner } from "@clack/prompts";
import { buildPluginProject } from "../release/release-plugin-project.js";

export async function buildCommand({ cwd } = {}) {
  intro("Sailor build");
  const s = spinner();
  s.start("Building plugin");
  const result = buildPluginProject({ cwd });
  s.stop("Build complete");
  outro("Plugin build is ready.");
  return result;
}
