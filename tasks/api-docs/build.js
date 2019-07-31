const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const util = require('util')
const gulpUtil = require('gulp-util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

module.exports = buildApiDocs

async function buildApiDocs() {
  const { dmdOpts, src, dest, partial, helper, include, rootTemplate } = config

  const template = await readFile(path.resolve(rootTemplate)).toString()

  async function toMarkdown (file) {
    const data = await jsdoc2md.getTemplateData({ files: file })
    return jsdoc2md.render({
      data,
      template,
      partial,
      helper,
      ...dmdOpts,
    })
  }

  const outputPath = file => path.resolve(dest,
    path.basename(file).replace(/\.js$/, '.md'))

  const promisedDocs = include.map(fileName => `${src}/${fileName}.js`).
    map(fileName => [fileName, toMarkdown(fileName)]).
    map(([fileName, promisedMarkdown]) => promisedMarkdown.then(
      data => writeFile(outputPath(fileName), data)).catch(gulpUtil.log))

  return Promise.all(promisedDocs).
    catch(gulpUtil.log)
}
