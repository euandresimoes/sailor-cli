import { intro, outro, spinner } from "@clack/prompts";
import { createPluginProject } from "../project/plugin-project.js";
import { promptCreatePlugin } from "../prompts/create-plugin.prompt.js";
import { createSuccessMessage } from "../ui/messages.js";

export async function createCommand({ cwd, prompt = promptCreatePlugin } = {}) {
  intro("Sailor create");
  const input = await prompt();

  if (!input) {
    return { cancelled: true };
  }

  const s = spinner();
  s.start("Creating plugin project");
  const result = createPluginProject({ cwd, input });
  s.stop("Project ready");
  outro(createSuccessMessage(result.projectDir));
  return result;
}
