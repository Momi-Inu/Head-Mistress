const gulp = require('gulp');
const { init: sourceInit, write: sourceWrite } = require('gulp-sourcemaps');
const srcProject = require('gulp-typescript').createProject('tsconfig.json');
const file = require('gulp-file');
const del = require('del');

gulp.task('cleaning', () => {
    return del('dist/**/*.*');
});
gulp.task('build-ts-develop', () => {
    return gulp.src('./botsrc/**/*.ts', { allowEmpty: true })
        .pipe(sourceInit({ loadMaps: true }))
        .pipe(srcProject()).js
        .pipe(sourceWrite('./'))
        .pipe(file('type.txt', 'DEVELOP'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build-ts-production', () => {
    return gulp.src('./botsrc/**/*.ts', { allowEmpty: true })
        .pipe(srcProject()).js
        .pipe(file('type.txt', 'PRODUCTION'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-js', () => {
    return gulp.src('./botsrc/**/*.js', { allowEmpty: true })
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-static', () => {
    return gulp.src('./botsrc/**/*.json', { allowEmpty: true })
        .pipe(gulp.dest('./dist'));
});

gulp.task('build-develop', gulp.series(
    'cleaning',
    'build-ts-develop',
    'copy-js',
    'copy-static'
));

gulp.task('build-production', gulp.series(
    'cleaning',
    'build-ts-production',
    'copy-js',
    'copy-static'
))