const clackPurple = "\x1b[38;2;132;0;255m";
const clackWhite = "\x1b[38;2;255;255;255m";
const clackGreenPattern = /\x1b\[(?:32|92)m/g;
const clackCyanGuidePattern = /\x1b\[(?:36|96)m([│└┌┐┘─])/g;
const clackCyanIconPattern = /\x1b\[(?:36|96)m([◆◇●○◻◼▪])/g;

export function themeClackOutput(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(clackCyanGuidePattern, `${clackWhite}$1`)
    .replace(clackCyanIconPattern, `${clackPurple}$1`)
    .replace(clackGreenPattern, clackPurple);
}

export async function withClackTheme(callback, output = process.stdout) {
  const originalWrite = output.write.bind(output);

  output.write = function writeThemed(chunk, ...args) {
    return originalWrite(themeClackOutput(chunk), ...args);
  };

  try {
    return await callback();
  } finally {
    output.write = originalWrite;
  }
}
