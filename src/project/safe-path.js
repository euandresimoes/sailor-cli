import path from "node:path";

export function resolveInside(baseDir, childPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, childPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside current directory: ${childPath}`);
  }

  return resolvedTarget;
}
