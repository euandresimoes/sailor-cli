import assert from "node:assert/strict";
import { describe, it } from "node:test";
import pc from "picocolors";

import { introBanner } from "../src/ui/messages.js";

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("introBanner", () => {
  it("renders the Sailor block text art", () => {
    const banner = stripAnsi(introBanner("Sailor create"));
    const lines = banner.split("\n");
    const labelIndex = lines.indexOf("Sailor create");
    const artLines = lines.slice(0, labelIndex);

    assert.match(banner, /Sailor create/);
    assert.equal(artLines.length, 6);
    assert.match(artLines.join("\n"), /███████╗/);
    assert.doesNotMatch(artLines.join("\n"), /____/);
  });

  it("uses the Sailor purple to blue gradient", () => {
    if (!pc.isColorSupported) return;

    const banner = introBanner();

    assert.match(banner, /\x1b\[38;2;227;87;255m/);
    assert.match(banner, /\x1b\[38;2;0;25;255m/);
  });
});
