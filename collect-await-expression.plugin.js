module.exports = (api) => {
    const { types: t, traverse } = api;
    return {
      name: "collect-await",
      visitor: {
        Function(path) {
          if (path.node.async) {
            const awaitExpressions = [];
            // Get a list of related await expressions within the async function body
            path.traverse(traverse.visitors.merge([
              environmentVisitor,
              {
                AwaitExpression(path) {
                  awaitExpressions.push(path);
                },
                ArrowFunctionExpression(path) {
                  path.skip();
                },
              }
            ]))
          }
        }
      }
    }
  }