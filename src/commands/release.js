import { intro, outro, spinner } from "@clack/prompts";
import { releasePluginProject } from "../release/release-plugin-project.js";
import { releaseSuccessMessage } from "../ui/messages.js";

const defaultUi = { intro, outro, spinner };

export async function releaseCommand({ cwd, ui = defaultUi, releaseProject = releasePluginProject } = {}) {
  ui.intro("Sailor release");
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
}
