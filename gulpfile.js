const gulp = require('gulp');
const shell = require('gulp-shell');

(() => {
    gulp.task('clean', () => {
        const del = require('del');
        return del('./dist/');
    });

    gulp.task('compile-ts', shell.task('tsc -p tsconfig.json && tsc-alias -p tsconfig.json'));

    gulp.task('create-package.json', (cb) => {
        const pkg = require('./package.json');
        const fs = require('fs');
        delete pkg.main
        fs.writeFile('./dist/package.json', JSON.stringify(pkg, null, 2), cb);
    });

    gulp.task('default', gulp.series('clean', 'compile-ts', 'create-package.json'));
})();