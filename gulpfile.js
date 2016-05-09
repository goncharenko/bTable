var $ = require('gulp-load-plugins')({
  lazy: true
});
var colors = $.util.colors;
var concat = require('gulp-concat');
var config = require('./gulp.config')();
var cssnano = require('gulp-cssnano');
var del = require('del');
var gulp = require('gulp');
var print = require('gulp-print');
var uglify = require('gulp-uglify');

gulp.task('default', ['clean'], function() {
  gulp.start('scripts', 'styles');
});

gulp.task('clean', function() {
  var delconfig = [].concat(
     config.build + 'scripts',
     config.build + 'styles');
  log('Cleaning: ' + colors.blue(delconfig));
  return del(delconfig);
});

gulp.task('scripts', function() {
  var appStream = gulp.src(config.js)
     .pipe($.if(config.jsOrder, $.order(config.jsOrder)))
     .pipe(concat('btable.js'))
     .pipe(gulp.dest(config.build))
     .pipe(concat('btable.min.js'))
     .pipe(uglify())
     .pipe(gulp.dest(config.build));
});

gulp.task('styles', function() {
  return gulp.src(config.css)
     .pipe(concat('btable.css'))
     .pipe(gulp.dest(config.build))
     .pipe(concat('btable.min.css'))
     .pipe(cssnano())
     .pipe(gulp.dest(config.build));
});

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log(colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log(colors.blue(msg));
  }
}
