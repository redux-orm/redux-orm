const jsdoc2md = require("jsdoc-to-markdown");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = buildApiDocs;

async function buildApiDocs() {
    const {
        dmdOpts,
        src,
        dest,
        partial,
        helper,
        include,
        rootTemplate,
        configure,
    } = config;

    const template = await readFile(path.resolve(rootTemplate));

    async function toMarkdown(file) {
        const data = await jsdoc2md.getTemplateData({ configure, files: file });
        const markdown = await jsdoc2md.render({
            data,
            configure,
            template: template.toString(),
            partial,
            helper,
            ...dmdOpts,
        });

        const outputPath = file =>
            path.resolve(dest, path.basename(file).replace(/\.js$/, ".md"));

        return writeFile(outputPath(file), markdown);
    }

    const promisedDocs = include
        .map(fileName => `${src}/${fileName}.js`)
        .map(fileName => toMarkdown(fileName));

    return Promise.all(promisedDocs);
}
