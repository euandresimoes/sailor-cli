import pc from "picocolors";

const textArt = String.raw`███████╗ █████╗ ██╗██╗      ██████╗ ██████╗
██╔════╝██╔══██╗██║██║     ██╔═══██╗██╔══██╗
███████╗███████║██║██║     ██║   ██║██████╔╝
╚════██║██╔══██║██║██║     ██║   ██║██╔══██╗
███████║██║  ██║██║███████╗╚██████╔╝██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝`;

const gradientStart = { r: 227, g: 87, b: 255 };
const gradientEnd = { r: 0, g: 25, b: 255 };

function interpolate(start, end, progress) {
  return Math.round(start + (end - start) * progress);
}

function rgb({ r, g, b }, value) {
  if (!pc.isColorSupported || !value) return value;
  return `\x1b[38;2;${r};${g};${b}m${value}\x1b[39m`;
}

function gradientLine(line, width) {
  return Array.from(line, (char, index) => {
    if (char === " ") return char;
    const progress = width <= 1 ? 0 : index / (width - 1);
    return rgb(
      {
        r: interpolate(gradientStart.r, gradientEnd.r, progress),
        g: interpolate(gradientStart.g, gradientEnd.g, progress),
        b: interpolate(gradientStart.b, gradientEnd.b, progress),
      },
      char,
    );
  }).join("");
}

function gradientText(value) {
  const lines = value.split("\n");
  const width = Math.max(...lines.map((line) => Array.from(line).length));
  return lines.map((line) => gradientLine(line, width)).join("\n");
}

export function introBanner(label) {
  const banner = gradientText(textArt);
  return label ? `${banner}\n${pc.bold(label)}` : banner;
}

export function spacedBanner({ trailingBlankLine = false } = {}) {
  return `\n${introBanner()}\n${trailingBlankLine ? "\n" : ""}`;
}

export function helpText(packageVersion) {
  return `\n${introBanner()}

${pc.bold(`Sailor CLI v${packageVersion}`)}

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
  sailor build

Read README.md in the project folder for the manifest guide and example notes.

Docs: ${pc.cyan("https://sailor.auvexis.com/api/docs")}`;
}

export function releaseSuccessMessage(releaseDir) {
  return `${pc.green("Release created.")} ${releaseDir}`;
}
