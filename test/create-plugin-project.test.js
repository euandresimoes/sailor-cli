import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { createPluginProject } from "../src/project/plugin-project.js";

function assertNoLegacyManifestUi(projectDir) {
  const rawManifest = fs.readFileSync(path.join(projectDir, "src", "manifest.json"), "utf8");
  const manifest = JSON.parse(rawManifest);

  assert.doesNotMatch(rawManifest, /"ui"\s*:/);
  assert.doesNotMatch(rawManifest, /"component"\s*:/);
  assert.doesNotMatch(rawManifest, /"actions"\s*:/);
  assert.doesNotMatch(rawManifest, /"x-sailor-display"\s*:/);

  for (const method of Object.values(manifest.methods)) {
    assert.equal(Object.hasOwn(method, "ui"), false);
  }
}

describe("createPluginProject", () => {
  it("creates a TypeScript Sailor plugin project in the current directory", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));

    const result = createPluginProject({
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

    assert.equal(result.projectDir, path.join(cwd, "demo-plugin"));
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "manifest.json")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "index.ts")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, "schemas", "sailor-plugin-manifest.schema.json")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, ".vscode", "settings.json")), true);

    const pkg = JSON.parse(fs.readFileSync(path.join(result.projectDir, "package.json"), "utf8"));
    const manifest = JSON.parse(fs.readFileSync(path.join(result.projectDir, "src", "manifest.json"), "utf8"));
    const index = fs.readFileSync(path.join(result.projectDir, "src", "index.ts"), "utf8");
    const readme = fs.readFileSync(path.join(result.projectDir, "README.md"), "utf8");

    assert.equal(pkg.dependencies["@auvexis/sailor-sdk"], "latest");
    assert.equal(pkg.scripts.build, "tsc -p tsconfig.json");
    assert.equal(manifest.metadata.name, "Demo Plugin");
    assert.equal(manifest.metadata.icon, "assets/icons/icon.svg");
    assert.equal(manifest.metadata.iconDark, "assets/icons/icon-dark.svg");
    assert.equal(manifest.metadata.iconLight, "assets/icons/icon-light.svg");
    assert.equal(manifest.metadata.category, "Tools");
    assert.equal(manifest.metadata.author, "Unknown");
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "assets", "icons", "icon.svg")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "assets", "icons", "icon-dark.svg")), true);
    assert.equal(fs.existsSync(path.join(result.projectDir, "src", "assets", "icons", "icon-light.svg")), true);
    assert.match(index, /This is the plugin entrypoint/);
    assert.match(index, /id: manifest\.metadata\.id,\n\n/);
    assert.match(readme, /How `src\/manifest\.json` Works/);
  });

  it("creates a project that can install dependencies and build", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-create-"));
    const installs = [];

    const result = createPluginProject({
      cwd,
      input: {
        name: "buildable-plugin",
        displayName: "Buildable Plugin",
        description: "Buildable plugin",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: true,
        exampleTemplate: "fruityvice",
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
            displayName: "Demo Plugin",
            description: "Demo plugin",
            icon: "",
            category: "Tools",
            author: "Unknown",
            repository: "",
            withExample: false,
            exampleTemplate: "blank",
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
        displayName: "Empty Plugin",
        description: "Empty plugin",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: false,
        exampleTemplate: "blank",
      },
      installDependencies: false,
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(projectDir, "src", "manifest.json"), "utf8"));
    const methods = fs.readFileSync(path.join(projectDir, "src", "methods.ts"), "utf8");

    assert.deepEqual(Object.keys(manifest.methods), ["run"]);
    assert.match(methods, /async run/);
    assert.doesNotMatch(methods, /message: string/);
  });

  it("creates selected example templates", () => {
    const cases = [
      ["fruit-plugin", "Fruits", "fruityvice", "listFruits", /Fruityvice/],
      ["posts-plugin", "Posts", "jsonplaceholder", "getPost", /JSONPlaceholder/],
      ["spotify-plugin", "Spotify", "spotify", "getCurrentUserProfile", /type: "oauth2"/],
      ["pokemon-plugin", "Pokemon", "pokeapi", "getPokemon", /PokeAPI/],
    ];

    for (const [name, displayName, exampleTemplate, methodName, codePattern] of cases) {
      const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-template-"));
      const { projectDir } = createPluginProject({
        cwd,
        input: {
          name,
          displayName,
          description: "Adds a simple integration.",
          icon: "https://example.com/icon.png",
          category: "Tools",
          author: "Unknown",
          repository: "",
          withExample: true,
          exampleTemplate,
        },
        installDependencies: false,
      });

      const manifest = JSON.parse(fs.readFileSync(path.join(projectDir, "src", "manifest.json"), "utf8"));
      const methods = fs.readFileSync(path.join(projectDir, "src", "methods.ts"), "utf8");
      const index = fs.readFileSync(path.join(projectDir, "src", "index.ts"), "utf8");

      assert.deepEqual(Object.keys(manifest.methods).includes(methodName), true);
      assert.match(methods + index, codePattern);
      assertNoLegacyManifestUi(projectDir);
    }
  });

  it("explains the Spotify OAuth provider steps in index.ts", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sailor-cli-spotify-docs-"));
    const { projectDir } = createPluginProject({
      cwd,
      input: {
        name: "spotify-plugin",
        displayName: "Spotify",
        description: "Adds a simple integration.",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: true,
        exampleTemplate: "spotify",
      },
      installDependencies: false,
    });

    const index = fs.readFileSync(path.join(projectDir, "src", "index.ts"), "utf8");

    assert.match(index, /Step 1: send the user to Spotify/);
    assert.match(index, /Step 2: Spotify sends Sailor a code/);
    assert.match(index, /Step 3: Sailor calls this when the access token expires/);
    assert.match(index, /Optional health check/);
  });
});
