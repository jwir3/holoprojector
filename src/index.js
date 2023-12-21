import { CommandLineLogger } from "./CommandLineLogger";
import prompt from "prompts";
import packageJson from "../package.json";

export async function CLIasync(logger) {
  const packageInfoLine = `${packageJson.name} v${packageJson.version}\n\n`;
  logger.logMessage(packageInfoLine);

  // Retrieve the name of the current folder in the user's path.
  const cwdPieces = process.cwd().split("/");
  const projectOrigName = cwdPieces[cwdPieces.length - 1];

  let done = false;
  while (!done) {
    const questions = [
      {
        type: "text",
        name: "projectName",
        message: "What is the name of your project?",
        initial: projectOrigName,
      },
      {
        type: "text",
        name: "location",
        message: "Where would you like this project to live?",
        initial: process.cwd(),
      },
      {
        type: "select",
        name: "projectType",
        message: "What type of graphics project is this?",
        choices: [
          {
            title: "OpenGL (C++)",
            description: "OpenGL using C++",
            value: "opengl",
          },
          {
            title: "WebGL (Javascript)",
            description: "WebGL using Javascript",
            value: "webgl",
          },
        ],
      },
      {
        type: "toggle",
        name: "createGitRepo",
        message: "Would you like to create a git repository?",
        active: "yes",
        inactive: "no",
        initial: "yes",
      },
    ];

    const answers = await prompt(questions, {
      /*onSubmit: cleanup,*/
      onCancel: () => {
        logger.logError("Project creation cancelled by user");
        process.exit(0);
      },
    });

    logger.logMessage("Ok, this is your requested configuration: \n");
    logger.logJson(answers);

    const confirmationQuestion = [
      {
        type: "toggle",
        name: "confirm",
        message: "Is this correct?",
        active: "yes",
        inactive: "no",
      },
    ];

    const confirmationAnswer = await prompt(confirmationQuestion, {
      onCancel: () => {
        logger.logError("Project creation cancelled by user");
        process.exit(0);
      },
    });

    done = confirmationAnswer.confirm;
  }

  logger.startProcess("Retrieving template code from github");
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
}

export function CLI(output) {
  const logger = new CommandLineLogger(output);

  CLIasync(logger).then(() => {
    logger.stopProcessSuccess();
  });
}
