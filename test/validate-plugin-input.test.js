import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validatePluginInput } from "../src/project/validate-plugin-input.js";

describe("validatePluginInput", () => {
  it("accepts valid plugin input", () => {
    assert.deepEqual(
      validatePluginInput({
        name: "openai-chat",
        description: "OpenAI chat plugin",
        icon: "bot",
        repository: "https://github.com/acme/openai-chat",
        withExample: true,
      }),
      {
        name: "openai-chat",
        description: "OpenAI chat plugin",
        icon: "bot",
        repository: "https://github.com/acme/openai-chat",
        withExample: true,
      },
    );
  });

  it("rejects unsafe names", () => {
    assert.throws(
      () => validatePluginInput({ name: "../bad", description: "Bad" }),
      /kebab-case/,
    );
    assert.throws(
      () => validatePluginInput({ name: "BadName", description: "Bad" }),
      /kebab-case/,
    );
  });
});
