const gulp = require('gulp');
const docgen = require('./tasks/docgen');
const deploy = require('./tasks/deploy');

gulp.task('deploy', deploy);
gulp.task('docgen', cb => docgen(cb));
