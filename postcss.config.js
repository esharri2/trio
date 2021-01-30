const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const precss = require("precss");
const postcssImport = require("postcss-import");

module.exports = {
  plugins: [
    precss, postcssImport, autoprefixer,
    ...(process.env.NODE_ENV === "production"
      ? [ cssnano({preset:'default'})]
      : [])
  ]
};
