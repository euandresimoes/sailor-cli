const COMMANDS = new Set(["create", "build", "release", "version"]);

function normalizeFlag(flag) {
  return flag.replace(/^--/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseArgs(argv) {
  const args = [...argv];
  const flags = {};
  let help = false;
  let version = false;
  const positional = [];

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--version" || arg === "-v") {
      version = true;
      continue;
    }
    if (arg.startsWith("--")) {
      flags[normalizeFlag(arg)] = true;
      continue;
    }
    positional.push(arg);
  }

  const command = positional[0] && COMMANDS.has(positional[0]) ? positional[0] : null;
  const subject = command === "create" ? positional[1] ?? "plugin" : null;

  return {
    command,
    subject,
    flags,
    help,
    version,
  };
}
