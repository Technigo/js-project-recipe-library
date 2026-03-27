{
    "chrome": "60",
    "opera": "47",
    "edge": "79",
    "firefox": "55",
    "safari": "11.1",
    "node": "8.3",
    "deno": "1",
    "ios": "11.3",
    "samsung": "8",
    "opera_mobile": "44",
    "electron": "2.0"
}
import { isRequired } from "@babel/helper-compilation-targets";

module.exports = api => {
  // Check if the targets have native object-rest-spread support
  const objectRestSpreadSupported = !isRequired(
    "transform-object-rest-spread",
    api.targets()
  );
};
import {
    isIdentifierName,
    isIdentifierStart,
    isIdentifierChar,
    isReservedWord,
    isStrictBindOnlyReservedWord,
    isStrictBindReservedWord,
    isStrictReservedWord,
    isKeyword,
  } from "@babel/helper-validator-identifier";
  import environmentVisitor, {
    requeueComputedKeyAndDecorators
  } from "@babel/helper-environment-visitor";
  if (path.isMethod()) {
    requeueComputedKeyAndDecorators(path)
  }