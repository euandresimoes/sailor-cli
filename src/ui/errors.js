import pc from "picocolors";

export function formatError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return pc.red(message);
}
