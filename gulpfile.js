const { task, series, watch } = require("gulp");

const apiDocs = require("./tasks/api-docs");

task("api-docs:clean", apiDocs.clean);
task("api-docs:build", apiDocs.build);
const apiDocsAll = series("api-docs:clean", "api-docs:build");

function apiDocsWatch() {
    watch(["src/**/*.js", "tasks/api-docs/**/*"], apiDocsAll);
}

exports["api-docs"] = apiDocsAll;
exports["api-docs:watch"] = apiDocsWatch;
