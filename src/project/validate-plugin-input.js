const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function cleanOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validatePluginInput(input) {
  const name = cleanOptionalString(input.name);
  const description = cleanOptionalString(input.description);
  const icon = cleanOptionalString(input.icon);
  const repository = cleanOptionalString(input.repository);

  if (!KEBAB_CASE_PATTERN.test(name)) {
    throw new Error("Plugin name must be kebab-case, for example: openai-chat");
  }

  if (!description) {
    throw new Error("Plugin description is required.");
  }

  if (repository && !/^https?:\/\/\S+$/.test(repository)) {
    throw new Error("Repository must be a valid http(s) URL or empty.");
  }

  return {
    name,
    description,
    icon,
    repository,
    withExample: Boolean(input.withExample),
  };
}
