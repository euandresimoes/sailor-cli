import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validatePluginInput } from "../src/project/validate-plugin-input.js";

describe("validatePluginInput", () => {
  it("accepts valid plugin input", () => {
    assert.deepEqual(
      validatePluginInput({
        name: "openai-chat",
        displayName: "OpenAI Chat",
        description: "OpenAI chat plugin",
        icon: "https://example.com/icon.png",
        category: "AI",
        author: "Acme",
        repository: "https://github.com/acme/openai-chat",
        withExample: true,
        exampleTemplate: "jsonplaceholder",
      }),
      {
        name: "openai-chat",
        displayName: "OpenAI Chat",
        description: "OpenAI chat plugin",
        icon: "https://example.com/icon.png",
        category: "AI",
        author: "Acme",
        repository: "https://github.com/acme/openai-chat",
        withExample: true,
        exampleTemplate: "jsonplaceholder",
      },
    );
  });

  it("applies manifest defaults and accepts URL or plugin-relative icons", () => {
    assert.deepEqual(
      validatePluginInput({
        name: "simple-plugin",
        displayName: "Simple Plugin",
        description: "Adds a simple integration.",
      }),
      {
        name: "simple-plugin",
        displayName: "Simple Plugin",
        description: "Adds a simple integration.",
        icon: "",
        category: "Tools",
        author: "Unknown",
        repository: "",
        withExample: false,
        exampleTemplate: "blank",
      },
    );

    assert.equal(
      validatePluginInput({
        name: "local-icon",
        displayName: "Local Icon",
        description: "Local icon",
        icon: "assets/icons/icon.svg",
      }).icon,
      "assets/icons/icon.svg",
    );

    assert.throws(
      () =>
        validatePluginInput({
          name: "bad-icon",
          displayName: "Bad Icon",
          description: "Bad icon",
          icon: "../icon.svg",
        }),
      /icon path/,
    );
  });

  it("rejects unsafe names", () => {
    assert.throws(
      () => validatePluginInput({ name: "../bad", displayName: "Bad", description: "Bad" }),
      /kebab-case/,
    );
    assert.throws(
      () => validatePluginInput({ name: "BadName", displayName: "Bad", description: "Bad" }),
      /kebab-case/,
    );
  });
});
