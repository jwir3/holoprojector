import json from "@rollup/plugin-json";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "cjs",
  },
  plugins: [json()],
};
