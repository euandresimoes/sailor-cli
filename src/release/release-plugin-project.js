import fs from "node:fs";
import path from "node:path";
import { validateManifest } from "@auvexis/sailor-sdk";
import { npmRun } from "../package-manager/npm.js";

const RELEASE_FILES = ["manifest.json", "package.json", "package-lock.json"];
const COMPILED_FILES = ["index.js", "methods.js"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} is missing: ${filePath}`);
  }
}

export function validatePluginProject(cwd) {
  const manifestPath = path.join(cwd, "manifest.json");
  assertFile(manifestPath, "manifest.json");

  const result = validateManifest(readJson(manifestPath));
  if (!result.valid) {
    throw new Error(`Invalid manifest:\n${result.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  return result.manifest;
}

export function buildPluginProject({ cwd, runner = npmRun } = {}) {
  validatePluginProject(cwd);
  runner(cwd, "build");
  return {
    distDir: path.join(cwd, "dist"),
  };
}

export function releasePluginProject({ cwd, runBuild = true, runner = npmRun } = {}) {
  const manifest = validatePluginProject(cwd);

  if (runBuild) {
    runner(cwd, "build");
  }

  const releaseDir = path.join(cwd, "release");
  fs.rmSync(releaseDir, { recursive: true, force: true });
  fs.mkdirSync(releaseDir, { recursive: true });

  for (const file of RELEASE_FILES) {
    const source = path.join(cwd, file);
    assertFile(source, file);
    fs.copyFileSync(source, path.join(releaseDir, file));
  }

  for (const file of COMPILED_FILES) {
    const source = path.join(cwd, "dist", file);
    assertFile(source, `dist/${file}`);
    fs.copyFileSync(source, path.join(releaseDir, file));
  }

  return {
    releaseDir,
    manifest,
  };
}
