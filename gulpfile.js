'use strict';
const fs         = require('fs');
const path       = require('path');
const gulp       = require('gulp');
const webpack    = require('gulp-webpack');
const named      = require('vinyl-named');
const sass       = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rm         = require('gulp-rimraf');


/* JavaScript */
gulp.task('js', ['js:clean'], function () {
  return gulp.src(['public/source/js/*.js', 'public/source/js/forms/*.js', 'public/source/js/pages/*.js'])
    .pipe(named())
    .pipe(webpack({
      devtool: 'source-map',
      output:  {
        filename:          '[name].js',
        sourceMapFilename: '[name].js.map'
      },
      module:  {
        loaders: [
          {
            test:    /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader:  'babel-loader',
            query:   {
              presets: ['es2015']
            }
          }
        ]
      },
    }))
    .pipe(gulp.dest('public/build/js/'));
});
gulp.task('js:watch', function () {
  gulp.watch(['public/source/js/**/*.js'], ['js']);
});
gulp.task('js:clean', function () {
  return gulp.src('./public/build/js/**/*')
    .pipe(rm({force: true}))
    ;
});


/* SASS/SCSS */
gulp.task('sass', ['sass:clean'], function () {
  return gulp.src('public/source/styles/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/build/styles/'));
});
gulp.task('sass:watch', function () {
  gulp.watch(['public/source/styles/**/*.scss'], ['sass', 'fonts']);
});
gulp.task('sass:clean', function () {
  return gulp.src('./public/build/styles/**/*')
    .pipe(rm({force: true}))
    ;
});


/* HTML */
gulp.task('html', ['html:clean'], function () {
  return gulp.src(['source/**/*.html', '!source/templates/**/**'])
    .pipe(gulp.dest('build/'));
});
gulp.task('html:watch', function () {
  gulp.watch(['source/**/*.html', '!source/templates/**/**'], ['html']);
});
gulp.task('html:clean', function () {
  return gulp.src(['./build/**/*.html', '!./build/templates/**/**'])
    .pipe(rm({force: true}))
    ;
});


/* Images */
gulp.task('images', ['images:clean'], function () {
  return gulp.src(['public/source/images/**/**'])
    .pipe(gulp.dest('public/build/images/'));
});
gulp.task('images:clean', function () {
  return gulp.src('./public/build/images/**/**')
    .pipe(rm({force: true}))
    ;
});


/* Favicon */
gulp.task('favicon', ['favicon:clean'], function () {
  return gulp.src(['public/source/favicon.ico'])
    .pipe(gulp.dest('public/build/'));
});
gulp.task('favicon:clean', function () {
  return gulp.src('./public/build/favicon.ico')
    .pipe(rm({force: true}))
    ;
});


/* Fonts */
gulp.task('fonts', ['fonts:clean'], function () {
  return gulp.src(['./node_modules/font-awesome/fonts/*.*'])
    .pipe(gulp.dest('public/build/fonts/'));
});
gulp.task('fonts:clean', function () {
  return gulp.src('./public/build/fonts/**/*')
    .pipe(rm({force: true}))
    ;
});


gulp.task('prepublish', ['nsp']);
gulp.task('build', ['js', 'sass', 'fonts', 'images', 'favicon']);
gulp.task('watch', ['js:watch', 'sass:watch']);
gulp.task('default', ['static', 'test', 'coveralls']);
