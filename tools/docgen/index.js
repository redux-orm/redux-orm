const jsdoc2md = require('jsdoc-to-markdown');
const fs       = require('fs');
const path     = require('path');

const {dest, partial, include, files} = require('./config');

const generateMarkdown = data => {
  const render = ([kind, name]) => {
    const output = jsdoc2md.renderSync({
      data,
      template: `{{#${kind} name="${name}"}}{{>docusaurus-header}}{{>docs}}{{/${kind}}}`,
      'name-format': true,
      partial,
    });

    fs.writeFileSync(path.resolve(dest, `${name}.md`), output);
  };

  return Object.keys(include).
                flatMap(kind => include[kind].map(name => [kind, name])).
                map(render);
};

module.exports = () => jsdoc2md.getTemplateData({files}).then(generateMarkdown);
