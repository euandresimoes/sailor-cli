import { intro, outro, spinner } from "@clack/prompts";
import { buildPluginProject } from "../release/release-plugin-project.js";

const defaultUi = { intro, outro, spinner };

export async function buildCommand({ cwd, ui = defaultUi, buildProject = buildPluginProject } = {}) {
  ui.intro("Sailor build");
  const s = ui.spinner();
  s.start("Building plugin");
  try {
    const result = buildProject({ cwd });
    s.stop("Build complete");
    ui.outro("Plugin build is ready.");
    return result;
  } catch (error) {
    s.stop("Build failed");
    throw error;
  }
}
