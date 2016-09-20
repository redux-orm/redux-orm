const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');
const rename = require('gulp-rename');

gulp.task('deploy', () =>
    gulp.src([
        './dist/**/*',
        './docs/**/*',
    ], { base: '.' })
    .pipe(rename(filepath => {
        if (filepath.dirname.startsWith('docs')) {
            // Collapses `docs` parent directory
            // so index.html ends up at the root.
            // `dist` remains in the dist folder.
            const withoutDocs = filepath.dirname.substring('docs'.length);
            const withoutLeadingSlash = withoutDocs.startsWith('/')
                ? withoutDocs.substring(1)
                : withoutDocs;

            filepath.dirname = withoutLeadingSlash;
        }
    }))
    .pipe(ghPages())
);
