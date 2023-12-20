const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    globalObject: "this",
    library: {
      name: "holoprojector",
      type: "umd",
    },
    clean: true,
  },
  resolve: {
    fallback: {
      process: require.resolve("process/browser"),
    },
  },
};
