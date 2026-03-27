const findBareSupers = traverse.visitors.merge<NodePath<t.CallExpression>[]>([
    {
      Super(path) {
        const { node, parentPath } = path;
        if (parentPath.isCallExpression({ callee: node })) {
          this.push(parentPath);
        }
      },
    },
    environmentVisitor,
  ]);