import { CommandLineLogger } from "./CommandLineLogger";
import prompt from "prompts";
import { simpleGit } from "simple-git";

import path from "path";
import os from "os";
import fs from "fs";

import packageJson from "../package.json";

const DEFAULT_TEMPLATE_REPO =
  "https://www.github.com/jwir3/graphics-templates.git";

let logger = new CommandLineLogger();

export async function CLIasync() {
  const packageInfoLine = `${packageJson.name} v${packageJson.version}\n\n`;
  logger.logMessage(packageInfoLine);

  // Retrieve the name of the current folder in the user's path.
  const cwdPieces = process.cwd().split("/");
  const projectOrigName = cwdPieces[cwdPieces.length - 1];

  let done = false;
  let finalAnswers = null;
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
    finalAnswers = answers;

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

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "graphicsTemplates-"));

  await startPhase(
    "checkDir",
    `Checking that ${finalAnswers.location} exists or creating it...`,
    () => {
      return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(finalAnswers.location)) {
          // We need to create the directory
          fs.mkdirSync(finalAnswers.location);
        } else {
          let files = fs.readdirSync(finalAnswers.location);
          if (files.length > 0) {
            reject(`${finalAnswers.location} is not empty!`);
          }
        }

        resolve();
      });
    }
  );

  // Clone the desired repo to a temporary directory.
  await startPhase(
    "cloneBaseRepo",
    `Retrieving the template repository...`,
    () => {
      let git = simpleGit();
      return git.clone(DEFAULT_TEMPLATE_REPO, tempDir);
    }
  );

  await startPhase(
    "copyBaseFiles",
    `Copying files from ${finalAnswers.projectType} to ${finalAnswers.location}...`,
    () => {
      return new Promise((resolve, reject) => {
        fs.cpSync(
          path.join(tempDir, finalAnswers.projectType),
          finalAnswers.location,
          { recursive: true }
        );
        fs.cpSync(
          path.join(tempDir, "shaders"),
          path.join(finalAnswers.location, "shaders"),
          {
            recursive: true,
          }
        );

        resolve();
      });
    }
  );

  if (finalAnswers.createGitRepo) {
    await startPhase("createGitRepo", "Creating git repository...", () => {
      let git = simpleGit({ baseDir: finalAnswers.location });
      return git.init();
    });
  }
}

function startPhase(name, description, workFunction, args) {
  logger.startProcess(description);

  return workFunction()
    .then(() => {
      logger.stopProcessSuccess();
    })
    .catch((err) => {
      logger.stopProcessFailure(err);
    });
}

export function CLI() {
  CLIasync();
}
