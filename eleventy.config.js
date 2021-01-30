const markdown = require("markdown-it")({
  html: true,
});
const path = require("path");
const minifyHTML = require("./site/transforms/minifyHTML.js");

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = (config) => {
  // Plugins
  config.addPlugin(eleventyNavigationPlugin);

  // Layout alias
  config.addLayoutAlias("default", "layouts/default.njk");
  config.addLayoutAlias("container", "layouts/container.njk");

  // Include our static assets
  config.addPassthroughCopy({ "site/assets": "/" });
  config.addPassthroughCopy({ "site/media/home": "/media" });
  config.addPassthroughCopy({ "site/media/home/icons": "/media" });

  config.setUseGitIgnore(false);
 
  // Transforms
  config.addTransform("minify html", minifyHTML);

  return {
    templateFormats: ["md", "njk", "json"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: "site",
      output: "dist",
      includes: "includes",
      data: "data",
    },
  };
};
