// npm install --save gulp
// npm install --save gulp-gh-pages
// npm install --save gulp-open
// npm install --save gulp-rename
// npm install --save gulp-i5ting-toc
// npm install --save shelljs
var gulp = require('gulp');
var gp_deploy = require('gulp-gh-pages');
var open = require("gulp-open");
var rename = require("gulp-rename");
var i5ting_toc = require('gulp-i5ting-toc');
require('shelljs/global');

var options = {}
gulp.task('deploy', function () {
    return gulp.src('./**/*')
        .pipe(gp_deploy(options));
});


gulp.task('default',['deploy'] ,function () {
  console.log('default');
});
