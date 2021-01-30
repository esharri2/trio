/*
LOADERS
css-loader: "The css-loader interprets @import and url() like import/require() and will resolve them."

PLUGINS
mini-css-extract-plugin: Extracts CSS to separate files
*/

const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: ["./js/main.js", "./css/main.css"],
    trio: ["./js/trio.js", "./css/trio.css"],
  },
  output: {
    path: path.resolve(__dirname, "site/assets"),
    filename: "[name].bundle.js",
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
};
