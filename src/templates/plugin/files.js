import { manifestSchema } from "@auvexis/sailor-sdk/manifest-schema";

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function manifest(input) {
  const methodName = input.withExample ? "echoMessage" : "run";

  return {
    metadata: {
      id: input.name,
      name: input.name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      description: input.description,
      icon: input.icon || "plug",
      category: "External",
      author: "Auvexis",
      version: "1.0.0",
      repository: input.repository,
    },
    methods: {
      [methodName]: {
        metadata: {
          label: input.withExample ? "Echo Message" : "Run",
          description: input.withExample
            ? "Echoes a message back to the workflow."
            : "Starter method for this plugin.",
        },
        parameters: {
          type: "object",
          properties: input.withExample
            ? {
                message: {
                  type: "string",
                  description: "Message to echo.",
                  "x-input-type": "text",
                },
              }
            : {},
          required: input.withExample ? ["message"] : [],
        },
        responseSchema: {
          type: "object",
          "x-sailor-display": "generic",
          properties: {
            ok: { type: "boolean", "x-label": "OK" },
            message: { type: "string", "x-label": "Message" },
          },
        },
        ui: {
          component: "card",
        },
      },
    },
  };
}

function packageJson(input) {
  return {
    name: input.name,
    version: "1.0.0",
    description: input.description,
    type: "module",
    main: "dist/index.js",
    scripts: {
      build: "tsc -p tsconfig.json",
    },
    dependencies: {
      "@auvexis/sailor-sdk": "latest",
    },
    devDependencies: {
      typescript: "^5.9.3",
    },
  };
}

function indexTs() {
  return `import { definePlugin, type PluginManifest } from "@auvexis/sailor-sdk";
import manifest from "./manifest.json" with { type: "json" };
import { createMethods } from "./methods.js";

export default definePlugin({
  id: manifest.metadata.id,
  manifest: manifest as PluginManifest,
  auth: { type: "none" },
  methods: createMethods(),
});
`;
}

function methodsTs(input) {
  if (!input.withExample) {
    return `export function createMethods() {
  return {
    async run() {
      return {
        ok: true,
      };
    },
  };
}
`;
  }

  return `export function createMethods() {
  return {
    async echoMessage(params: { message: string }) {
      return {
        ok: true,
        message: params.message,
      };
    },
  };
}
`;
}

export function pluginFiles(input) {
  return new Map([
    ["package.json", json(packageJson(input))],
    ["src/manifest.json", json(manifest(input))],
    ["schemas/sailor-plugin-manifest.schema.json", json(manifestSchema)],
    [
      ".vscode/settings.json",
      json({
        "json.schemas": [
          {
            fileMatch: ["/src/manifest.json"],
            url: "./schemas/sailor-plugin-manifest.schema.json",
          },
        ],
      }),
    ],
    [
      "tsconfig.json",
      json({
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          outDir: "dist",
          rootDir: "src",
          strict: true,
          resolveJsonModule: true,
          skipLibCheck: true,
        },
        include: ["src/**/*.ts"],
      }),
    ],
    [".gitignore", "node_modules/\ndist/\nrelease/\n"],
    ["README.md", `# ${input.name}\n\n${input.description}\n`],
    ["src/index.ts", indexTs()],
    ["src/methods.ts", methodsTs(input)],
  ]);
}
