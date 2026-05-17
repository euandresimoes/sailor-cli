const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function cleanOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validatePluginInput(input) {
  const name = cleanOptionalString(input.name);
  const displayName = cleanOptionalString(input.displayName);
  const description = cleanOptionalString(input.description);
  const icon = cleanOptionalString(input.icon);
  const category = cleanOptionalString(input.category) || "Tools";
  const author = cleanOptionalString(input.author) || "Unknown";
  const repository = cleanOptionalString(input.repository);
  const withExample = Boolean(input.withExample);
  const exampleTemplate = cleanOptionalString(input.exampleTemplate) || (withExample ? "fruityvice" : "blank");

  if (!KEBAB_CASE_PATTERN.test(name)) {
    throw new Error("Plugin name must be kebab-case, for example: openai-chat");
  }

  if (!displayName) {
    throw new Error("Plugin name is required.");
  }

  if (!description) {
    throw new Error("Plugin description is required.");
  }

  if (icon && !/^https?:\/\/\S+$/.test(icon)) {
    throw new Error("Icon must be a valid image URL or empty.");
  }

  if (repository && !/^https?:\/\/\S+$/.test(repository)) {
    throw new Error("Repository must be a valid http(s) URL or empty.");
  }

  if (!["blank", "fruityvice", "jsonplaceholder", "spotify", "pokeapi"].includes(exampleTemplate)) {
    throw new Error("Unknown example template.");
  }

  return {
    name,
    displayName,
    description,
    icon,
    category,
    author,
    repository,
    withExample,
    exampleTemplate: withExample ? exampleTemplate : "blank",
  };
}
