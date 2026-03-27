// a naive plugin replace `a.b` to `a != null && a.b`
module.exports = api => {
    const targets = api.targets();
    // The targets have native optional chaining support
    // if `transform-optional-chaining` is _not_ required
    const optionalChainingSupported = !isRequired(
      "transform-optional-chaining",
      targets
    );
    const visited = new WeakSet();
    return {
      visitor: {
        MemberExpression(path) {
          if (path.matchesPattern("a.b")) {
            if (visited.has(path.node)) return;
            visited.add(path.node);
            if (optionalChainingSupported) {
              // When optional chaining is supported,
              // output `a?.b` instead of `a != null && a.b`
              path.replaceWith(api.templates`a?.b`);
            } else {
              path.replaceWith(api.templates`a != null && ${path.node}`);
            }
          }
        },
      },
    };
  };