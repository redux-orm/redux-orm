const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')
const taskConfig = require('./config')

module.exports = (callback) => processSources(callback)

function processSources (callback) {
  const {
          dmdOpts, dest, partial, helper, rootTemplate, include,
        } = taskConfig

  function processFile (file) {
    return jsdoc2md.getTemplateData({ files: file }).
      then(data => render(data)).
      then(md => fs.writeFileSync(path.resolve(dest, `${file}.md`), md))

    function render (data) {
      return jsdoc2md.renderSync({
        data,
        template,
        partial,
        helper,
        ...dmdOpts,
      })
    }

  }

  const template = fs.readFileSync(path.resolve(rootTemplate)).
    toString()

  const promisedDocs = include.map(file => `src/${file}.js`).map(processFile)

  return Promise.all(promisedDocs).finally(() => callback(null, this))
}
