import babel from "rollup-plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import pkg from "./package.json";

const config = {
  input: "src/index.js",
  output: [
    {
      file: pkg.browser,
      format: "umd",
      name: "Example"
    },
    {
      file: pkg.main,
      format: "cjs",
      name: "Example"
    },
    {
      file: pkg.module,
      format: "es"
    }
  ],
  external: ["react", "react-dom"],
  plugins: [
    peerDepsExternal(),
    babel({ exclude: "node_modules/**" }),
    resolve()
  ]
};

export default config;
