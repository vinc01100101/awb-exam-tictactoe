module.exports = {
  entry: {
    main: "./src/main.js"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name]-bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  mode: "development"
};
