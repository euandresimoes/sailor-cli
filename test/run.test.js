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

describe("run", () => {
  it("prints help", async () => {
    const stdout = stream();
    const exitCode = await run({ argv: ["--help"], stdout, stderr: stream() });

    assert.equal(exitCode, 0);
    assert.match(stdout.value(), /sailor create/);
  });

  it("returns a clean error for unknown create targets", async () => {
    const stderr = stream();
    const exitCode = await run({ argv: ["create", "workflow"], stdout: stream(), stderr });

    assert.equal(exitCode, 1);
    assert.match(stderr.value(), /Unknown create target/);
  });
});
