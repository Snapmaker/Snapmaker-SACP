const gulp = require('gulp');
const shell = require('gulp-shell');

(() => {
    gulp.task('clean', () => {
        const del = require('del');
        return del('./dist/');
    });

    // gulp.task('eslint', shell.task('eslint -p tsconfig.json'));

    gulp.task('compile-ts', shell.task('tsc -p tsconfig.json && tsc-alias -p tsconfig.json'));

    gulp.task('copy-files', () => {
        return gulp.src(['./package.json']).pipe(gulp.dest('./dist/'));
    });

    gulp.task('default', gulp.series('clean', gulp.parallel('copy-files', 'compile-ts')));
})();