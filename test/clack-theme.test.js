import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { themeClackOutput } from "../src/ui/clack-theme.js";

describe("clack theme", () => {
  it("remaps prompt icons to purple and active guide pipes to white", () => {
    const themed = themeClackOutput("\x1b[32m\u25C6\x1b[39m \x1b[36m\u2502\x1b[39m");

    assert.equal(themed, "\x1b[38;2;132;0;255m\u25C6\x1b[39m \x1b[38;2;255;255;255m\u2502\x1b[39m");
  });
});
