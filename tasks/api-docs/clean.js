const gulp = require("gulp");
const clean = require("gulp-clean");
const config = require("./config");

module.exports = () =>
    gulp
        .src([`${config.dest}/**/*.md`, `!${config.dest}/**/README.md`])
        .pipe(clean({ force: true }));
