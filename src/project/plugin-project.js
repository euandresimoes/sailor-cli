import fs from "node:fs";
import path from "node:path";
import { npmInstall } from "../package-manager/npm.js";
import { pluginFiles } from "../templates/plugin/files.js";
import { resolveInside } from "./safe-path.js";
import { validatePluginInput } from "./validate-plugin-input.js";

function writeFiles(projectDir, files) {
  for (const [relativePath, content] of files.entries()) {
    const target = resolveInside(projectDir, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }
}

export function createPluginProject({ cwd, input, installDependencies = true, installer = npmInstall }) {
  const validated = validatePluginInput(input);
  const projectDir = resolveInside(cwd, validated.name);

  if (fs.existsSync(projectDir)) {
    throw new Error(`Plugin directory already exists: ${validated.name}`);
  }

  fs.mkdirSync(projectDir, { recursive: true });
  writeFiles(projectDir, pluginFiles(validated));

  if (installDependencies) {
    installer(projectDir);
  }

  return {
    projectDir,
    input: validated,
  };
}
