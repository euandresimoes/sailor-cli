import { manifestSchema } from "@auvexis/sailor-sdk/manifest-schema";

const EXAMPLE_TEMPLATES = {
  blank: {
    methodName: "run",
    label: "Run",
    description: "Starter method for this plugin.",
  },
  fruityvice: {
    methodName: "listFruits",
    label: "List Fruits",
    description: "Returns a list of fruits from Fruityvice.",
  },
  jsonplaceholder: {
    methodName: "getPost",
    label: "Get Post",
    description: "Loads one post from JSONPlaceholder.",
  },
  spotify: {
    methodName: "getCurrentUserProfile",
    label: "Get Current User Profile",
    description: "Returns the Spotify profile for the connected user.",
  },
  pokeapi: {
    methodName: "getPokemon",
    label: "Get Pokemon",
    description: "Loads one Pokemon from PokeAPI.",
  },
};

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function exampleTemplate(input) {
  return EXAMPLE_TEMPLATES[input.exampleTemplate] ? input.exampleTemplate : input.withExample ? "fruityvice" : "blank";
}

function manifestMetadata(input) {
  return {
    id: input.name,
    name: input.displayName,
    description: input.description,
    icon: input.icon,
    category: input.category,
    author: input.author,
    version: "1.0.0",
    repository: input.repository,
  };
}

function methodDefinition(input) {
  switch (exampleTemplate(input)) {
    case "fruityvice":
      return {
        listFruits: {
          metadata: {
            label: "List Fruits",
            description: "Returns a list of fruits from Fruityvice.",
          },
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          responseSchema: {
            type: "object",
            properties: {
              count: { type: "integer", "x-label": "Count" },
              fruits: {
                type: "array",
                "x-label": "Fruits",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", "x-label": "Name" },
                    family: { type: "string", "x-label": "Family" },
                    calories: { type: "number", "x-label": "Calories" },
                  },
                },
              },
            },
          },
        },
      };
    case "jsonplaceholder":
      return {
        getPost: {
          metadata: {
            label: "Get Post",
            description: "Loads one post from JSONPlaceholder.",
          },
          parameters: {
            type: "object",
            properties: {
              postId: {
                type: "integer",
                description: "Post ID from 1 to 100.",
                minimum: 1,
                maximum: 100,
                default: 1,
                "x-input-type": "number",
              },
            },
            required: ["postId"],
          },
          responseSchema: {
            type: "object",
            properties: {
              id: { type: "integer", "x-label": "Post ID" },
              title: { type: "string", "x-label": "Title" },
              body: { type: "string", "x-label": "Body" },
            },
          },
        },
      };
    case "spotify":
      return {
        getCurrentUserProfile: {
          metadata: {
            label: "Get Current User Profile",
            description: "Returns the Spotify profile for the connected user.",
          },
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          responseSchema: {
            type: "object",
            properties: {
              id: { type: "string", "x-label": "ID" },
              displayName: { type: "string", "x-label": "Display Name" },
              email: { type: "string", "x-label": "Email" },
            },
          },
        },
        play: playerMethod("Play", "Starts or resumes playback."),
        pause: playerMethod("Pause", "Pauses playback."),
        nextTrack: playerMethod("Next Track", "Skips to the next track."),
        previousTrack: playerMethod("Previous Track", "Skips to the previous track."),
      };
    case "pokeapi":
      return {
        getPokemon: {
          metadata: {
            label: "Get Pokemon",
            description: "Loads one Pokemon from PokeAPI.",
          },
          parameters: {
            type: "object",
            properties: {
              nameOrId: {
                type: "string",
                description: "Pokemon name or ID.",
                default: "pikachu",
                "x-input-type": "text",
              },
            },
            required: ["nameOrId"],
          },
          responseSchema: {
            type: "object",
            properties: {
              id: { type: "integer", "x-label": "ID" },
              name: { type: "string", "x-label": "Name" },
              height: { type: "number", "x-label": "Height" },
              weight: { type: "number", "x-label": "Weight" },
              types: {
                type: "array",
                "x-label": "Types",
                items: { type: "string" },
              },
            },
          },
        },
      };
    default:
      return {
        run: {
          metadata: {
            label: "Run",
            description: "Starter method for this plugin.",
          },
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          responseSchema: {
            type: "object",
            properties: {
              ok: { type: "boolean", "x-label": "OK" },
              message: { type: "string", "x-label": "Message" },
            },
          },
        },
      };
  }
}

function playerMethod(label, description) {
  return {
    metadata: {
      label,
      description,
    },
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    responseSchema: {
      type: "object",
      properties: {
        ok: { type: "boolean", "x-label": "OK" },
        message: { type: "string", "x-label": "Message" },
      },
    },
  };
}

function manifest(input) {
  return {
    metadata: manifestMetadata(input),
    methods: methodDefinition(input),
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

function indexTs(input) {
  if (exampleTemplate(input) === "spotify") return spotifyIndexTs();

  return `import { definePlugin, type PluginManifest } from "@auvexis/sailor-sdk";
import manifest from "./manifest.json" with { type: "json" };
import { createMethods } from "./methods.js";

/*
 * This is the plugin entrypoint.
 *
 * Sailor loads this file, reads the manifest, checks the auth provider,
 * and calls the methods returned by createMethods() when a workflow runs.
 */
export default definePlugin({
  /*
   * Keep this value aligned with metadata.id in manifest.json.
   */
  id: manifest.metadata.id,

  /*
   * The manifest describes the plugin contract: name, inputs, outputs, and methods.
   */
  manifest: manifest as PluginManifest,

  /*
   * This starter template does not require OAuth2 or API keys.
   */
  auth: { type: "none" },

  /*
   * The actual method implementations live in methods.ts.
   */
  methods: createMethods(),
});
`;
}

function spotifyIndexTs() {
  return `import { definePlugin, type OAuth2Tokens, type PluginManifest } from "@auvexis/sailor-sdk";
import { Buffer } from "node:buffer";
import manifest from "./manifest.json" with { type: "json" };
import { createMethods } from "./methods.js";

/*
 * Spotify needs OAuth2 scopes before Sailor can call the Web API.
 * Start with these, then remove anything your plugin does not use.
 */
const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
];

function spotifyBasicAuth(credentials: Record<string, string>) {
  return Buffer.from(\`\${credentials.clientId}:\${credentials.clientSecret}\`, "utf8").toString("base64");
}

function spotifyTokenBody(values: Record<string, string>) {
  return new URLSearchParams(values);
}

export default definePlugin({
  /*
   * Keep this value aligned with metadata.id in manifest.json.
   */
  id: manifest.metadata.id,

  /*
   * The manifest describes the plugin UI: name, inputs, outputs, and methods.
   */
  manifest: manifest as PluginManifest,

  /*
   * Sailor uses this OAuth2 provider to connect a user's Spotify account.
   */
  auth: {
    /*
     * OAuth2 tells Sailor to run the connection flow before calling methods.
     */
    type: "oauth2",

    /*
     * These fields are shown in Sailor when the user configures the plugin.
     * Spotify gives you both values in the app dashboard.
     */
    credentialSchema: {
      clientId: {
        type: "string",
        inputType: "text",
        label: "Client ID",
        description: "Spotify app client ID.",
        required: true,
      },
      clientSecret: {
        type: "string",
        inputType: "password",
        label: "Client Secret",
        description: "Spotify app client secret.",
        required: true,
      },
    },

    /*
     * Scopes define what the connected account allows this plugin to do.
     */
    scopes: SPOTIFY_SCOPES,

    /*
     * This controls the copy and icon shown in Sailor's auth screen.
     */
    ui: {
      buttonText: "Connect Spotify",
      buttonIcon: "music",
      oauthCallbackInstructions: "Add the Sailor redirect URL to your Spotify app before connecting.",
    },

    /*
     * Step 1: send the user to Spotify so they can approve the connection.
     */
    getAuthUrl(credentials, redirectUri) {
      const url = new URL("https://accounts.spotify.com/authorize");
      url.searchParams.set("client_id", credentials.clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
      return url.toString();
    },

    /*
     * Step 2: Spotify sends Sailor a code, then Sailor exchanges it for tokens.
     */
    async exchangeCode(code, credentials, redirectUri): Promise<OAuth2Tokens> {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: \`Basic \${spotifyBasicAuth(credentials)}\`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: spotifyTokenBody({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error("Spotify token exchange failed.");
      }

      const data = await response.json() as OAuth2Tokens & { expires_in?: number };
      return {
        ...data,
        expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      };
    },

    /*
     * Step 3: Sailor calls this when the access token expires.
     */
    async refreshTokens(tokens, credentials): Promise<OAuth2Tokens> {
      if (!tokens.refresh_token) {
        throw new Error("Spotify did not return a refresh token.");
      }

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: \`Basic \${spotifyBasicAuth(credentials)}\`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: spotifyTokenBody({
          grant_type: "refresh_token",
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Spotify token refresh failed.");
      }

      const data = await response.json() as OAuth2Tokens & { expires_in?: number };
      return {
        ...data,
        refresh_token: data.refresh_token ?? tokens.refresh_token,
        expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      };
    },

    /*
     * Optional health check used by Sailor to confirm the connection still works.
     */
    async testConnection(tokens) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: \`Bearer \${tokens.access_token}\` },
      });
      return response.ok;
    },
  },

  /*
   * The actual Spotify API calls live in methods.ts.
   */
  methods: createMethods(),
});
`;
}

function methodsTs(input) {
  switch (exampleTemplate(input)) {
    case "fruityvice":
      return fruityviceMethodsTs();
    case "jsonplaceholder":
      return jsonPlaceholderMethodsTs();
    case "spotify":
      return spotifyMethodsTs();
    case "pokeapi":
      return pokeApiMethodsTs();
    default:
      return blankMethodsTs();
  }
}

function blankMethodsTs() {
  return `export function createMethods() {
  return {
    async run() {
      /*
       * This is the smallest useful Sailor method.
       * Replace this return value with the work your plugin should do.
       */
      return {
        ok: true,
        message: "Your plugin is ready.",
      };
    },
  };
}
`;
}

function fruityviceMethodsTs() {
  return `type FruityviceFruit = {
  name: string;
  family: string;
  nutritions?: {
    calories?: number;
  };
};

export function createMethods() {
  return {
    async listFruits() {
      /*
       * Fruityvice is a friendly first API because it does not need OAuth2
       * or an API key. This method fetches the full fruit list and keeps only
       * a few fields so the response is easy to read in Sailor.
       */
      const response = await fetch("https://www.fruityvice.com/api/fruit/all");

      if (!response.ok) {
        throw new Error("Could not load fruits from Fruityvice.");
      }

      const fruits = await response.json() as FruityviceFruit[];

      return {
        count: fruits.length,
        fruits: fruits.map((fruit) => ({
          name: fruit.name,
          family: fruit.family,
          calories: fruit.nutritions?.calories ?? 0,
        })),
      };
    },
  };
}
`;
}

function jsonPlaceholderMethodsTs() {
  return `type GetPostParams = {
  postId: number;
};

type JsonPlaceholderPost = {
  id: number;
  title: string;
  body: string;
};

export function createMethods() {
  return {
    async getPost(params: GetPostParams) {
      /*
       * JSONPlaceholder is a fake REST API for learning and prototypes.
       * The method receives one parameter from Sailor and uses it in the URL.
       */
      const response = await fetch(\`https://jsonplaceholder.typicode.com/posts/\${params.postId}\`);

      if (!response.ok) {
        throw new Error(\`Post \${params.postId} was not found.\`);
      }

      const post = await response.json() as JsonPlaceholderPost;

      return {
        id: post.id,
        title: post.title,
        body: post.body,
      };
    },
  };
}
`;
}

function spotifyMethodsTs() {
  return `import type { PluginContext } from "@auvexis/sailor-sdk";

function spotifyHeaders(context?: PluginContext) {
  /*
   * OAuth2 access tokens are provided by Sailor in the method context.
   * Throwing here gives a clear error when the plugin has not been connected.
   */
  const token = context?.tokens?.access_token;

  if (!token) {
    throw new Error("Spotify is not connected.");
  }

  return {
    Authorization: \`Bearer \${token}\`,
  };
}

async function spotifyPlayerCommand(context: PluginContext | undefined, endpoint: string, message: string) {
  const response = await fetch(\`https://api.spotify.com/v1/me/player/\${endpoint}\`, {
    method: "POST",
    headers: spotifyHeaders(context),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(\`Spotify player command failed: \${message}\`);
  }

  return {
    ok: true,
    message,
  };
}

export function createMethods() {
  return {
    async getCurrentUserProfile(_params: Record<string, never>, context?: PluginContext) {
      /*
       * This method shows the most common OAuth2 pattern:
       * call a protected API with the access token Sailor gives you.
       */
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: spotifyHeaders(context),
      });

      if (!response.ok) {
        throw new Error("Could not load the Spotify profile.");
      }

      const profile = await response.json() as {
        id: string;
        display_name?: string;
        email?: string;
      };

      return {
        id: profile.id,
        displayName: profile.display_name ?? "",
        email: profile.email ?? "",
      };
    },

    async play(_params: Record<string, never>, context?: PluginContext) {
      return spotifyPlayerCommand(context, "play", "Playback started.");
    },

    async pause(_params: Record<string, never>, context?: PluginContext) {
      return spotifyPlayerCommand(context, "pause", "Playback paused.");
    },

    async nextTrack(_params: Record<string, never>, context?: PluginContext) {
      return spotifyPlayerCommand(context, "next", "Skipped to the next track.");
    },

    async previousTrack(_params: Record<string, never>, context?: PluginContext) {
      return spotifyPlayerCommand(context, "previous", "Skipped to the previous track.");
    },
  };
}
`;
}

function pokeApiMethodsTs() {
  return `type GetPokemonParams = {
  nameOrId: string;
};

type PokeApiPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
};

export function createMethods() {
  return {
    async getPokemon(params: GetPokemonParams) {
      /*
       * PokeAPI is useful for learning because every resource is public.
       * Names are lowercase in the API, so we normalize user input first.
       */
      const nameOrId = String(params.nameOrId).trim().toLowerCase();
      const response = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${nameOrId}\`);

      if (!response.ok) {
        throw new Error(\`Pokemon "\${params.nameOrId}" was not found.\`);
      }

      const pokemon = await response.json() as PokeApiPokemon;

      return {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map((entry) => entry.type.name),
      };
    },
  };
}
`;
}

function readme(input) {
  const template = EXAMPLE_TEMPLATES[exampleTemplate(input)];

  return `# ${input.displayName}

${input.description}

## Start Here

Run these commands from this folder:

\`\`\`bash
npm run build
\`\`\`

## How \`src/manifest.json\` Works

The manifest is the contract between your plugin and Sailor.

- \`metadata.id\` is the stable handle for the plugin. Keep it kebab-case.
- \`metadata.name\` is the human-friendly name shown in Sailor.
- \`metadata.description\`, \`category\`, \`author\`, and \`version\` describe the plugin in the UI.
- \`metadata.icon\` is only for image URLs. Leave it empty if you do not have one yet.
- \`methods\` declares what your plugin can do. Each method has a label, input parameters, and a response schema.

The TypeScript implementation for those methods lives in \`src/methods.ts\`.

## Current Example

This project was created with the ${template.label} example.

Open \`src/methods.ts\` first. It has comments that explain the important parts without hiding the actual code.
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
    ["README.md", readme(input)],
    ["src/index.ts", indexTs(input)],
    ["src/methods.ts", methodsTs(input)],
  ]);
}
