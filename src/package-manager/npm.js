import { spawnSync } from "node:child_process";

export function npmInstall(cwd) {
  const result = spawnSync("npm", ["install"], {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error("npm install failed.");
  }
}

export function npmRun(cwd, script) {
  const result = spawnSync("npm", ["run", script], {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`npm run ${script} failed.`);
  }
}
