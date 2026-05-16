import { intro, outro, spinner } from "@clack/prompts";
import { releasePluginProject } from "../release/release-plugin-project.js";
import { releaseSuccessMessage } from "../ui/messages.js";

export async function releaseCommand({ cwd } = {}) {
  intro("Sailor release");
  const s = spinner();
  s.start("Creating release");
  const result = releasePluginProject({ cwd });
  s.stop("Release ready");
  outro(releaseSuccessMessage(result.releaseDir));
  return result;
}
