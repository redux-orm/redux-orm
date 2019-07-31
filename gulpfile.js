const gulp = require('gulp')
const apiDocs = require('./tasks/api-docs')
const deploy = require('./tasks/deploy')

gulp.task('deploy', deploy)

gulp.task('api-docs:clean', apiDocs.clean)
gulp.task('api-docs:build', apiDocs.build)
exports['api-docs'] = gulp.series('api-docs:clean', 'api-docs:build')

