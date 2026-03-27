module.exports = (api) => {
    const { types: t } = api;
    return {
      name: "replace-top-level-this",
      visitor: {
        ThisExpression(path) {
          path.replaceWith(t.identifier("globalThis"));
        }
      }
    }
  }
  replace-top-level-this-plugin.js
module.exports = (api) => {
  const { types: t } = api;
  return {
    name: "replace-top-level-this",
    visitor: {
      ThisExpression(path) {
        path.replaceWith(t.identifier("globalThis"));
      }
      "FunctionDeclaration|FunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod"(path) {
        path.skip();
      }
    }
  }
}
module.exports = (api) => {
    const { types: t } = api;
    return {
      name: "replace-top-level-this",
      visitor: {
        ThisExpression(path) {
          path.replaceWith(t.identifier("globalThis"));
        }
        FunctionParent(path) {
          if (!path.isArrowFunctionExpression()) {
            path.skip();
          }
        }
      }
    }
  }
  import {
    requeueComputedKeyAndDecorators
  } from "@babel/helper-environment-visitor";
  
  module.exports = (api) => {
    const { types: t } = api;
    return {
      name: "replace-top-level-this",
      visitor: {
        ThisExpression(path) {
          path.replaceWith(t.identifier("globalThis"));
        }
        FunctionParent(path) {
          if (!path.isArrowFunctionExpression()) {
            path.skip();
          }
          if (path.isMethod()) {
            requeueComputedKeyAndDecorators(path);
          }
        }
      }
    }
  }
  import environmentVisitor from "@babel/helper-environment-visitor";

module.exports = (api) => {
  const { types: t, traverse } = api;
  return {
    name: "replace-top-level-this",
    visitor: traverse.visitors.merge([
      {
        ThisExpression(path) {
          path.replaceWith(t.identifier("globalThis"));
        }
      },
      environmentVisitor
    ]);
  }
}