import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseArgs } from "../src/cli/parse-args.js";

describe("parseArgs", () => {
  it("routes create to create plugin by default", () => {
    assert.deepEqual(parseArgs(["create"]), {
      command: "create",
      subject: "plugin",
      flags: {},
      help: false,
      version: false,
    });
  });

  it("routes explicit commands and flags", () => {
    assert.deepEqual(parseArgs(["release", "--dry-run"]), {
      command: "release",
      subject: null,
      flags: { dryRun: true },
      help: false,
      version: false,
    });
  });

  it("detects help and version", () => {
    assert.equal(parseArgs(["--help"]).help, true);
    assert.equal(parseArgs(["-v"]).version, true);
  });
});
