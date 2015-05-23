var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    mocha = require('gulp-spawn-mocha');

function browser() {
  return browserify({
      entries: ['./src/'],
      standalone: 'dl',
      cache: {}, packageCache: {}
    })
    .external(['d3', 'topojson']);
}

function build() {
  return browser().bundle()
    .pipe(source('datalib.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.'))
    // This will minify and rename to datalib.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('.'));
}

gulp.task('build', function() { build(); });

gulp.task('test', function() {
  return gulp.src(['test/**/*.js'], { read: false })
    .pipe(mocha())
    .on('error', gutil.log);
});

gulp.task('jshint', function() {  
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['test', 'build']);
