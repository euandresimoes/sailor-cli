import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { npmInstall } from "../src/package-manager/npm.js";

describe("npm helpers", () => {
  it("runs npm install without streaming npm output by default", () => {
    let options;
    npmInstall("C:/tmp/project", {
      spawnSyncImpl(_command, _args, passedOptions) {
        options = passedOptions;
        return { status: 0 };
      },
    });

    assert.equal(options.stdio, "pipe");
  });
});
