import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { run } from "../src/cli/run.js";

function stream() {
  let value = "";
  return {
    write(chunk) {
      value += chunk;
    },
    value() {
      return value;
    },
  };
}

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("run", () => {
  it("prints help", async () => {
    const stdout = stream();
    const exitCode = await run({ argv: ["--help"], stdout, stderr: stream() });
    const output = stripAnsi(stdout.value());

    assert.equal(exitCode, 0);
    assert.match(output, /███████╗/);
    assert.ok(output.indexOf("███████╗") < output.indexOf("Usage:"));
    assert.match(output, /sailor create/);
  });

  it("prints raw version for the version flag", async () => {
    const stdout = stream();
    const exitCode = await run({ argv: ["--version"], stdout, stderr: stream() });

    assert.equal(exitCode, 0);
    assert.equal(stdout.value(), "1.0.0\n");
  });

  it("prints version command details with spacing after the Sailor banner", async () => {
    const stdout = stream();
    const exitCode = await run({ argv: ["version"], stdout, stderr: stream() });
    const output = stripAnsi(stdout.value());

    assert.equal(exitCode, 0);
    assert.match(output, /^\n███████╗/);
    assert.match(output, /\n\nSailor CLI v1\.0\.0\n\nUsage:/);
    assert.match(output, /Docs:\n  https:\/\/sailor\.auvexis\.com\/api\/docs\n$/);
  });

  it("returns a clean error for unknown create targets", async () => {
    const stderr = stream();
    const exitCode = await run({ argv: ["create", "workflow"], stdout: stream(), stderr });

    assert.equal(exitCode, 1);
    assert.match(stderr.value(), /Unknown create target/);
  });
});
