import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { createPluginProject } from "../src/project/plugin-project.js";
import { buildPluginProject, releasePluginProject } from "../src/release/release-plugin-project.js";

describe("releasePluginProject", () => {
  it("increments the manifest patch version before building", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-build-"));
    const { projectDir } = createPluginProject({
      cwd,
      input: {
        name: "demo-plugin",
        displayName: "Demo Plugin",
        description: "Demo plugin",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: true,
        exampleTemplate: "fruityvice",
      },
      installDependencies: false,
    });
    const calls = [];

    buildPluginProject({
      cwd: projectDir,
      runner(buildCwd, script) {
        calls.push([buildCwd, script]);
      },
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(projectDir, "src", "manifest.json"), "utf8"));
    assert.equal(manifest.metadata.version, "1.0.1");
    assert.deepEqual(calls, [[projectDir, "build"]]);
  });

  it("creates a release folder with files expected by Sailor server", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-release-"));
    const { projectDir } = createPluginProject({
      cwd,
      input: {
        name: "demo-plugin",
        displayName: "Demo Plugin",
        description: "Demo plugin",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: true,
        exampleTemplate: "fruityvice",
      },
      installDependencies: false,
    });
    fs.writeFileSync(path.join(projectDir, "package-lock.json"), "{}");
    fs.mkdirSync(path.join(projectDir, "dist"), { recursive: true });
    fs.mkdirSync(path.join(projectDir, "dist", "utils"), { recursive: true });
    fs.writeFileSync(path.join(projectDir, "dist", "index.js"), "export default {};");
    fs.writeFileSync(path.join(projectDir, "dist", "methods.js"), "export function createMethods() { return {}; }");
    fs.writeFileSync(path.join(projectDir, "dist", "utils", "format.js"), "export const format = String;");

    const result = releasePluginProject({
      cwd: projectDir,
      runBuild: false,
    });

    assert.equal(result.releaseDir, path.join(projectDir, "release", "demo-plugin-1.0.0"));
    for (const file of ["manifest.json", "index.js", "methods.js", "package.json", "package-lock.json"]) {
      assert.equal(fs.existsSync(path.join(result.releaseDir, file)), true);
    }
    assert.equal(fs.existsSync(path.join(result.releaseDir, "utils", "format.js")), true);
  });
});
