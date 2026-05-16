import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCommand } from "../src/commands/build.js";
import { releaseCommand } from "../src/commands/release.js";

function fakeUi(events) {
  return {
    intro(message) {
      events.push(`intro:${message}`);
    },
    outro(message) {
      events.push(`outro:${message}`);
    },
    spinner() {
      return {
        start(message) {
          events.push(`start:${message}`);
        },
        stop(message) {
          events.push(`stop:${message}`);
        },
      };
    },
  };
}

describe("command spinners", () => {
  it("stops build spinner when validation fails", async () => {
    const events = [];
    await assert.rejects(
      () =>
        buildCommand({
          cwd: "C:/empty",
          ui: fakeUi(events),
          buildProject() {
            throw new Error("manifest.json is missing");
          },
        }),
      /manifest/,
    );

    assert.deepEqual(events, [
      "intro:Sailor build",
      "start:Building plugin",
      "stop:Build failed",
    ]);
  });

  it("stops release spinner when validation fails", async () => {
    const events = [];
    await assert.rejects(
      () =>
        releaseCommand({
          cwd: "C:/empty",
          ui: fakeUi(events),
          releaseProject() {
            throw new Error("manifest.json is missing");
          },
        }),
      /manifest/,
    );

    assert.deepEqual(events, [
      "intro:Sailor release",
      "start:Creating release",
      "stop:Release failed",
    ]);
  });
});
