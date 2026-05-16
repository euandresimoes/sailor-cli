import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { createPluginProject } from "../src/project/plugin-project.js";

describe("createPluginProject", () => {
  it("creates a TypeScript Sailor plugin project in the current directory", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));

    const result = createPluginProject({
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

    assert.equal(result.projectDir, path.join(cwd, "demo-plugin"));
    assert.equal(fs.existsSync(path.join(result.projectDir, "manifest.json")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "index.ts")), true);

    const pkg = JSON.parse(fs.readFileSync(path.join(result.projectDir, "package.json"), "utf8"));
    assert.equal(pkg.dependencies["@auvexis/sailor-sdk"], "latest");
    assert.equal(pkg.scripts.build, "tsc -p tsconfig.json");
  });

  it("creates a project that can install dependencies and build", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));
    const installs = [];

    const result = createPluginProject({
      cwd,
      input: {
        name: "buildable-plugin",
        description: "Buildable plugin",
        icon: "",
        repository: "",
        withExample: true,
      },
      installDependencies: true,
      installer(projectDir) {
        installs.push(projectDir);
        fs.writeFileSync(path.join(projectDir, "package-lock.json"), "{}");
      },
    });

    assert.deepEqual(installs, [result.projectDir]);
    assert.match(fs.readFileSync(path.join(result.projectDir, "src", "index.ts"), "utf8"), /definePlugin/);
  });

  it("does not overwrite an existing directory", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));
    fs.mkdirSync(path.join(cwd, "demo-plugin"));

    assert.throws(
      () =>
        createPluginProject({
          cwd,
          input: {
            name: "demo-plugin",
            description: "Demo plugin",
            icon: "",
            repository: "",
            withExample: false,
          },
          installDependencies: false,
        }),
      /already exists/,
    );
  });

  it("keeps the no-example project runtime aligned with the manifest", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));

    const { projectDir } = createPluginProject({
      cwd,
      input: {
        name: "empty-plugin",
        description: "Empty plugin",
        icon: "",
        repository: "",
        withExample: false,
      },
      installDependencies: false,
    });

    const methods = fs.readFileSync(path.join(projectDir, "src", "methods.ts"), "utf8");
    assert.match(methods, /async ping/);
  });
});
