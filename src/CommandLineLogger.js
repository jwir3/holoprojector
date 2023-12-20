import ansiColors from "ansi-colors";

import pad from "@stdlib/string-pad";

const cursorEsc = {
  hide: "\u001B[?25l",
  show: "\u001B[?25h",
};

export class CommandLineLogger {
  constructor(outputDevice) {
    this.output = outputDevice;
    this.processTimer = null;
    this.lastMessageCharacters = 0;
  }

  startProcess(message) {
    const characters = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

    this.output.write(cursorEsc.hide);

    let i = 0;
    let self = this;
    this.processTimer = setInterval(function () {
      let nextDisplayableString = characters[i++] + " " + message;
      if (this.lastMessageCharacters > 0) {
        nextDisplayableString = pad(
          nextDisplayableString,
          this.lastMessageCharacters
        );
      }

      this.lastMessageCharacters = nextDisplayableString.length;
      self.output.write("\r\t" + nextDisplayableString);
      i = i >= characters.length ? 0 : i;
    }, 150);

    return () => {
      clearInterval(this.processTimer);
      this.output.write("\r\t");
      this.output.write(cursorEsc.show);
    };
  }

  stopProcess(message) {
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.output.write(cursorEsc.hide);
      this.output.write(
        "\r\t" +
          ansiColors.green("✔") +
          " " +
          pad(message, this.lastMessageCharacters, {
            rpad: " ",
          }) +
          "\n"
      );
    }
  }
}
