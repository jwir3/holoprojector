#! /usr/bin/env node
let outputDevice = require("process").stdout;
require(__dirname + "/../dist").CLI(outputDevice);
