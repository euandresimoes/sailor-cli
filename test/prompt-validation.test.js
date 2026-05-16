import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateDescriptionPromptValue } from "../src/prompts/create-plugin.prompt.js";

describe("prompt validation", () => {
  it("handles empty clack text values without throwing", () => {
    assert.equal(validateDescriptionPromptValue(undefined), "Description is required.");
    assert.equal(validateDescriptionPromptValue(""), "Description is required.");
    assert.equal(validateDescriptionPromptValue("  "), "Description is required.");
    assert.equal(validateDescriptionPromptValue("Useful plugin"), undefined);
  });
});
