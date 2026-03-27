import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
    },
  },
]);
import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          // your babel options
          presets: ["@babel/preset-env"],
        },
      },
    },
  },
]);
import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: "path/to/babel.config.js",
        },
      },
    },
  },
]);
import babelParserExperimentalWorker from "@babel/eslint-parser/experimental-worker";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParserExperimentalWorker,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: "path/to/babel.config.mjs",
        },
      },
    },
  },
]);
import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["files/transformed/by/babel/*.js"],
    languageOptions: {
      parser: babelParser,
    },
  },
]);
import babelParser from "@babel/eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        babelOptions: {
          rootMode: "upward",
        },
      },
    },
  },
]);
import babelParser from "@babel/eslint-parser";
import babelPlugin from "@babel/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
    },
    plugins: {
      babel: babelPlugin
    },
    rules: {
      "new-cap": "off",
      "no-undef": "off",
      "no-unused-expressions": "off",
      "object-curly-spacing": "off",

      "babel/new-cap": "error",
      "babel/no-undef": "error",
      "babel/no-unused-expressions": "error",
      "babel/object-curly-spacing": "error"
    }
  },
]);