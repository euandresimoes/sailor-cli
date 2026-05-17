import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCommand } from "../commands/create.js";
import { buildCommand } from "../commands/build.js";
import { releaseCommand } from "../commands/release.js";
import { parseArgs } from "./parse-args.js";
import { formatError } from "../ui/errors.js";
import { helpText } from "../ui/messages.js";

function packageVersion() {
  const currentFile = fileURLToPath(import.meta.url);
  const packagePath = path.resolve(currentFile, "..", "..", "..", "package.json");
  return JSON.parse(readFileSync(packagePath, "utf8")).version;
}

export async function run({ argv = process.argv.slice(2), cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr } = {}) {
  const parsed = parseArgs(argv);
  const version = packageVersion();

  try {
    if (parsed.version) {
      stdout.write(`${version}\n`);
      return 0;
    }

    if (parsed.help || !parsed.command) {
      stdout.write(helpText(version));
      return 0;
    }

    if (parsed.command === "version") {
      stdout.write(helpText(version));
      return 0;
    }

    if (parsed.command === "create") {
      if (parsed.subject !== "plugin") {
        throw new Error(`Unknown create target: ${parsed.subject}`);
      }
      await createCommand({ cwd });
      return 0;
    }

    if (parsed.command === "build") {
      await buildCommand({ cwd });
      return 0;
    }

    if (parsed.command === "release") {
      await releaseCommand({ cwd });
      return 0;
    }

    throw new Error(`Unknown command: ${parsed.command}`);
  } catch (error) {
    stderr.write(`${formatError(error)}\n`);
    return 1;
  }
}
