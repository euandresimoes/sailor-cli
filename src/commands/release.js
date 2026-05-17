import { outro, spinner } from "@clack/prompts";
import { releasePluginProject } from "../release/release-plugin-project.js";
import { withClackTheme } from "../ui/clack-theme.js";
import { releaseSuccessMessage, spacedBanner } from "../ui/messages.js";

const defaultUi = {
  banner(message) {
    process.stdout.write(message);
  },
  outro,
  spinner,
};

export async function releaseCommand({ cwd, ui = defaultUi, releaseProject = releasePluginProject } = {}) {
  return withClackTheme(async () => {
    ui.banner(spacedBanner());
    const s = ui.spinner();
    s.start("Creating release");
    try {
      const result = releaseProject({ cwd });
      s.stop("Release ready");
      ui.outro(releaseSuccessMessage(result.releaseDir));
      return result;
    } catch (error) {
      s.stop("Release failed");
      throw error;
    }
  });
}
