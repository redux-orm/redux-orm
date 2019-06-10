const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');
const rename = require('gulp-rename');
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

gulp.task('deploy', () => gulp.src([
    './dist/**/*',
    './docs/**/*',
], { base: '.' })
    .pipe(rename((filepath) => {
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

gulp.task('generate-docusaurus-docs', (done) => {
    const docusaurusDocPage = (name, content) => `---\nid: ${name.toLowerCase()}\ntitle: ${name}\nsidebar_label: ${name}\nhide_title: true\n---\n\n${content}`;

    const includedClasses = ['ORM', 'Model', 'QuerySet', 'Session'];

    /* get template data */
    const templateData = jsdoc2md.getTemplateDataSync({ files: 'src/**/*.js' });

    const classes = templateData.reduce((classNames, identifier) => {
        if (identifier.kind === 'class' && includedClasses.includes(identifier.name)) classNames.push(identifier.name);
        return classNames;
    }, []);

    const includedFunctions = ['createReducer', 'createSelector', 'attr', 'oneToOne', 'fk', 'many'];

    const functions = templateData.reduce((functionNames, identifier) => {
        if (identifier.kind === 'function' && includedFunctions.includes(identifier.name)) functionNames.push(identifier.name);
        return functionNames;
    }, []);

    /* create a documentation file for each class */
    classes.forEach((className) => {
        const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;
        console.log(`rendering ${className}, template: ${template}`);
        const output = jsdoc2md.renderSync({ data: templateData, template });
        fs.writeFileSync(path.resolve('docs/api', `${className}.md`), docusaurusDocPage(className, output));
    });

    /* create a documentation file for each function */
    functions.forEach((functionName) => {
        const template = `{{#function name="${functionName}"}}{{>docs}}{{/function}}`;
        console.log(`rendering ${functionName}, template: ${template}`);
        const output = jsdoc2md.renderSync({ data: templateData, template });
        fs.writeFileSync(path.resolve('docs/api', `${functionName}.md`), docusaurusDocPage(functionName, output));
    });

    return done();
});
