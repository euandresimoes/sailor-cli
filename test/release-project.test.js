import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { createPluginProject } from "../src/project/plugin-project.js";
import { releasePluginProject } from "../src/release/release-plugin-project.js";

describe("releasePluginProject", () => {
  it("creates a release folder with files expected by Sailor server", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-release-"));
    const { projectDir } = createPluginProject({
      cwd,
      input: {
        name: "demo-plugin",
        description: "Demo plugin",
        icon: "",
        repository: "",
        withExample: true,
      },
      installDependencies: false,
    });
    fs.writeFileSync(path.join(projectDir, "package-lock.json"), "{}");
    fs.mkdirSync(path.join(projectDir, "dist"), { recursive: true });
    fs.writeFileSync(path.join(projectDir, "dist", "index.js"), "export default {};");
    fs.writeFileSync(path.join(projectDir, "dist", "methods.js"), "export function createMethods() { return {}; }");

    const result = releasePluginProject({
      cwd: projectDir,
      runBuild: false,
    });

    for (const file of ["manifest.json", "index.js", "methods.js", "package.json", "package-lock.json"]) {
      assert.equal(fs.existsSync(path.join(result.releaseDir, file)), true);
    }
  });
});
