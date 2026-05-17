import { outro, spinner } from "@clack/prompts";
import { buildPluginProject } from "../release/release-plugin-project.js";
import { withClackTheme } from "../ui/clack-theme.js";
import { spacedBanner } from "../ui/messages.js";

const defaultUi = {
  banner(message) {
    process.stdout.write(message);
  },
  outro,
  spinner,
};

export async function buildCommand({ cwd, ui = defaultUi, buildProject = buildPluginProject } = {}) {
  return withClackTheme(async () => {
    ui.banner(spacedBanner());
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
  });
}
