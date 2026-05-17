import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCommand } from "../src/commands/build.js";
import { releaseCommand } from "../src/commands/release.js";

function fakeUi(events) {
  return {
    banner(message) {
      events.push(`banner:${message}`);
    },
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

    assert.equal(events.length, 3);
    assert.match(events[0], /^banner:\n/);
    assert.doesNotMatch(events[0], /\n\n$/);
    assert.deepEqual(events.slice(1), [
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

    assert.equal(events.length, 3);
    assert.match(events[0], /^banner:\n/);
    assert.doesNotMatch(events[0], /\n\n$/);
    assert.deepEqual(events.slice(1), [
      "start:Creating release",
      "stop:Release failed",
    ]);
  });
});
