import ansiColors from "ansi-colors";

import pad from "@stdlib/string-pad";
import { highlight } from "cli-highlight";

const cursorEsc = {
  hide: "\u001B[?25l",
  show: "\u001B[?25h",
};

export class CommandLineLogger {
  constructor(outputDevice) {
    this.output = outputDevice;
    this.processTimer = null;
    this.lastMessage = null;
  }

  startProcess(message) {
    const characters = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

    this.output.write(cursorEsc.hide);

    let i = 0;
    let self = this;
    this.processTimer = setInterval(function () {
      let nextDisplayableString = characters[i++] + " " + message;
      if (self.lastMessage && self.lastMessage.length > 0) {
        nextDisplayableString = pad(
          nextDisplayableString,
          self.lastMessage.length
        );
      }

      self.lastMessage = message;
      self.output.write("\r  " + nextDisplayableString);
      i = i >= characters.length ? 0 : i;
    }, 150);

    return () => {
      clearInterval(this.processTimer);
      this.output.write("\r  ");
      this.output.write(cursorEsc.show);
    };
  }

  stopProcessSuccess(message) {
    if (!message) {
      message = this.lastMessage;
    }

    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.output.write(cursorEsc.hide);
      this.output.write(
        "\r  " +
          ansiColors.green("✔") +
          " " +
          pad(message, this.lastMessage.length + 10, {
            rpad: " ",
          }) +
          "\n"
      );
    }
  }

  logMessage(message) {
    this.output.write(ansiColors.bold(message));
  }

  logError(message) {
    this.output.write(ansiColors.bold.redBright("Error: " + message + "\n"));
  }

  logJson(code) {
    const prettifiedCode = JSON.stringify(code, null, 4);
    this.output.write(highlight(prettifiedCode) + "\n\n");
  }
}
