var gulp = require('gulp'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    mocha = require('gulp-spawn-mocha');

function browser() {
  return browserify({
      entries: ['./src/'],
      standalone: 'dl',
      debug: true,
      cache: {}, packageCache: {}
    })
    .external(['d3', 'topojson']); 
}

function watcher() {
  return watchify(browser());
}

function build() {
  return browser().bundle()
    .pipe(source('datalib.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.'))
    .pipe(sourcemaps.init({loadMaps: true}))
    // This will minify and rename to datalib.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.')); 
}

gulp.task('build', function() { build() });

gulp.task('test', function() {
  return gulp.src(['test/**/*.js'], { read: false })
    .pipe(mocha())
    .on('error', gutil.log);
});

gulp.task('default', ['test', 'build']);