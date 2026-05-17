import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultPluginDescription } from "../src/prompts/create-plugin.prompt.js";

describe("prompt defaults", () => {
  it("provides a default plugin description", () => {
    assert.equal(defaultPluginDescription("openai-chat"), "Adds a simple integration.");
  });
});
