# Sailor CLI

CLI for creating, building and releasing Sailor plugins.

## Commands

```bash
sailor create
sailor create plugin
sailor build
sailor release
```

## Create a Plugin

```bash
sailor create
```

The CLI asks for:

- plugin name
- description
- logo/icon, optional
- repository URL, optional
- example code or empty project

It creates a TypeScript plugin project in the current directory and installs `@auvexis/sailor-sdk`.
The plugin manifest is generated at `src/manifest.json` with local VS Code JSON schema settings for IntelliSense.

Docs: https://sailor.auvexis.com/api/docs

## Build

```bash
sailor build
```

Validates `manifest.json` with `@auvexis/sailor-sdk` and runs the plugin build script.
The CLI reads the manifest from `src/manifest.json`.

## Release

```bash
sailor release
```

Builds the plugin and creates a `release/` folder with the files expected by Sailor server:

- `manifest.json`
- `index.js`
- `methods.js`
- `package.json`
- `package-lock.json`
