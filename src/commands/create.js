import { outro, spinner } from "@clack/prompts";
import { createPluginProject } from "../project/plugin-project.js";
import { npmInstall } from "../package-manager/npm.js";
import { promptCreatePlugin } from "../prompts/create-plugin.prompt.js";
import { withClackTheme } from "../ui/clack-theme.js";
import { createSuccessMessage, spacedBanner } from "../ui/messages.js";

export async function createCommand({ cwd, prompt = promptCreatePlugin } = {}) {
  return withClackTheme(async () => {
    process.stdout.write(spacedBanner());
    const input = await prompt();

    if (!input) {
      return { cancelled: true };
    }

    const s = spinner();
    s.start("Creating plugin files");
    const result = createPluginProject({ cwd, input, installDependencies: false });
    s.stop("Project files created");

    s.start("Downloading packages");
    npmInstall(result.projectDir);
    s.stop("Dependencies installed");

    outro(createSuccessMessage(result.projectDir));
    return result;
  });
}
