import pc from "picocolors";

export function helpText(packageVersion) {
  return `${pc.bold("Sailor CLI")} ${pc.dim(`v${packageVersion}`)}

Usage:
  sailor create
  sailor create plugin
  sailor build
  sailor release

Commands:
  create   Create a new Sailor plugin project
  build    Validate and build the current plugin
  release  Build and create a Sailor installable release folder

Docs:
  https://sailor.auvexis.com/api/docs
`;
}

export function createSuccessMessage(projectDir) {
  return `${pc.green("Plugin created.")} Next:
  cd ${projectDir}
  npm run build

Docs: ${pc.cyan("https://sailor.auvexis.com/api/docs")}`;
}

export function releaseSuccessMessage(releaseDir) {
  return `${pc.green("Release created.")} ${releaseDir}`;
}
