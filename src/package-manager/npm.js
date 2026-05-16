import { spawnSync } from "node:child_process";

export function npmInstall(cwd, options = {}) {
  const spawnSyncImpl = options.spawnSyncImpl ?? spawnSync;
  const result = spawnSyncImpl("npm", ["install"], {
    cwd,
    stdio: options.stdio ?? "pipe",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error("npm install failed.");
  }
}

export function npmRun(cwd, script, options = {}) {
  const spawnSyncImpl = options.spawnSyncImpl ?? spawnSync;
  const result = spawnSyncImpl("npm", ["run", script], {
    cwd,
    stdio: options.stdio ?? "pipe",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`npm run ${script} failed.`);
  }
}
