import { CommandLineLogger } from "./CommandLineLogger";
export async function CLIasync(logger) {
  logger.startProcess("A long running process");
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
}

export function CLI(output) {
  const logger = new CommandLineLogger(output);
  CLIasync(logger).then(() => {
    logger.stopProcess("Long runner finished!");
  });
}
