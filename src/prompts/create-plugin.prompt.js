import { cancel, confirm, isCancel, text } from "@clack/prompts";

function readValue(value) {
  if (isCancel(value)) {
    cancel("Create cancelled.");
    return null;
  }
  return value;
}

export function validateDescriptionPromptValue(value) {
  if (!String(value ?? "").trim()) return "Description is required.";
  return undefined;
}

export async function promptCreatePlugin() {
  const name = readValue(
    await text({
      message: "Plugin name",
      placeholder: "openai-chat",
      validate(value) {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return "Use kebab-case, for example: openai-chat";
        }
      },
    }),
  );
  if (name === null) return null;

  const description = readValue(
    await text({
      message: "Description",
      placeholder: "Connects Sailor to OpenAI chat",
      validate: validateDescriptionPromptValue,
    }),
  );
  if (description === null) return null;

  const icon = readValue(
    await text({
      message: "Plugin logo/icon",
      placeholder: "plug or https://example.com/icon.png",
      defaultValue: "",
    }),
  );
  if (icon === null) return null;

  const repository = readValue(
    await text({
      message: "Repository URL",
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

  return {
    name,
    description,
    icon,
    repository,
    withExample,
  };
}
