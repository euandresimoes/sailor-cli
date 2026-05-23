import fs from "node:fs";
import path from "node:path";
import { validateManifest } from "@auvexis/sailor-sdk";
import { npmRun } from "../package-manager/npm.js";

const RELEASE_FILES = ["manifest.json", "package.json", "package-lock.json"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} is missing: ${filePath}`);
  }
}

function assertDirectory(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isDirectory()) {
    throw new Error(`${label} is missing: ${filePath}`);
  }
}

function copyDirectory(sourceDir, targetDir) {
  assertDirectory(sourceDir, sourceDir);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(source, target);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(source, target);
    }
  }
}

function manifestPath(cwd) {
  return path.join(cwd, "src", "manifest.json");
}

function incrementPatchVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid manifest version: ${version}`);
  }

  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

function bumpManifestPatchVersion(cwd) {
  const filePath = manifestPath(cwd);
  assertFile(filePath, "manifest.json");

  const manifest = readJson(filePath);
  manifest.metadata.version = incrementPatchVersion(manifest.metadata.version);
  writeJson(filePath, manifest);
  return manifest;
}

export function validatePluginProject(cwd) {
  const filePath = manifestPath(cwd);
  assertFile(filePath, "manifest.json");

  const result = validateManifest(readJson(filePath));
  if (!result.valid) {
    throw new Error(`Invalid manifest:\n${result.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  return result.manifest;
}

export function buildPluginProject({ cwd, runner = npmRun } = {}) {
  bumpManifestPatchVersion(cwd);
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

  const releaseRootDir = path.join(cwd, "release");
  const releaseDir = path.join(releaseRootDir, `${manifest.metadata.id}-${manifest.metadata.version}`);
  fs.mkdirSync(releaseRootDir, { recursive: true });
  fs.rmSync(releaseDir, { recursive: true, force: true });
  fs.mkdirSync(releaseDir, { recursive: true });

  for (const file of RELEASE_FILES) {
    const source = file === "manifest.json" ? path.join(cwd, "src", file) : path.join(cwd, file);
    assertFile(source, file);
    fs.copyFileSync(source, path.join(releaseDir, file));
  }

  const distDir = path.join(cwd, "dist");
  assertFile(path.join(distDir, "index.js"), "dist/index.js");
  copyDirectory(distDir, releaseDir);

  const assetsDir = path.join(cwd, "src", "assets");
  if (fs.existsSync(assetsDir)) {
    copyDirectory(assetsDir, path.join(releaseDir, "assets"));
  }

  return {
    releaseDir,
    manifest,
  };
}
