import { cancel, confirm, isCancel, select, text } from "@clack/prompts";

function readValue(value) {
  if (isCancel(value)) {
    cancel("Create cancelled.");
    return null;
  }
  return value;
}

export function defaultPluginDescription(name) {
  return "Adds a simple integration.";
}

export async function promptCreatePlugin() {
  const name = readValue(
    await text({
      message: "Handle (ID)",
      placeholder: "openai-chat",
      validate(value) {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return "Use kebab-case, for example: openai-chat";
        }
      },
    }),
  );
  if (name === null) return null;

  const displayName = readValue(
    await text({
      message: "Name",
      placeholder: "OpenAI Chat",
      defaultValue: name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      validate(value) {
        if (!String(value ?? "").trim()) return "Name is required.";
      },
    }),
  );
  if (displayName === null) return null;

  const description = readValue(
    await text({
      message: "Description",
      placeholder: "Connects Sailor to OpenAI chat",
      defaultValue: defaultPluginDescription(name),
      validate(value) {
        if (!String(value ?? "").trim()) return "Description is required.";
      },
    }),
  );
  if (description === null) return null;

  const icon = readValue(
    await text({
      message: "Icon URL (optional)",
      placeholder: "https://example.com/icon.png",
      defaultValue: "",
      validate(value) {
        if (value && !/^https?:\/\/\S+$/.test(value)) {
          return "Use an image URL or leave empty. Lucide icons are not supported here.";
        }
      },
    }),
  );
  if (icon === null) return null;

  const category = readValue(
    await text({
      message: "Category",
      placeholder: "Tools",
      defaultValue: "Tools",
      validate(value) {
        if (!String(value ?? "").trim()) return "Category is required.";
      },
    }),
  );
  if (category === null) return null;

  const author = readValue(
    await text({
      message: "Author",
      placeholder: "Unknown",
      defaultValue: "Unknown",
      validate(value) {
        if (!String(value ?? "").trim()) return "Author is required.";
      },
    }),
  );
  if (author === null) return null;

  const repository = readValue(
    await text({
      message: "Repository URL (optional)",
      placeholder: "https://github.com/acme/openai-chat",
      defaultValue: "",
      validate(value) {
        if (value && !/^https?:\/\/\S+$/.test(value)) {
          return "Use an http(s) URL or leave empty.";
        }
      },
    }),
  );
  if (repository === null) return null;

  const withExample = readValue(
    await confirm({
      message: "Include example code?",
      initialValue: true,
    }),
  );
  if (withExample === null) return null;

  const exampleTemplate = withExample
    ? readValue(
        await select({
          message: "Example template",
          options: [
            { value: "fruityvice", label: "Fruityvice", hint: "No auth, list fruits" },
            { value: "jsonplaceholder", label: "JSONPlaceholder", hint: "No auth, fake REST API" },
            { value: "spotify", label: "Spotify", hint: "OAuth2, profile and player controls" },
            { value: "pokeapi", label: "PokeAPI", hint: "No auth, Pokemon lookup" },
          ],
        }),
      )
    : "blank";
  if (exampleTemplate === null) return null;

  return {
    name,
    displayName,
    description,
    icon,
    category,
    author,
    repository,
    withExample,
    exampleTemplate,
  };
}
