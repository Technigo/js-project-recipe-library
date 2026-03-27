module: {
    rules: [
      {
        loader: "babel-loader",
        options: {
          rootMode: "upward",
        },
      },
    ];
  }
  module.exports = {
    entry: ["@babel/polyfill", "./app/js"],
  };