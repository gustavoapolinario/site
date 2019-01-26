let gulp = require('gulp');
let sass = require('gulp-sass');
let header = require('gulp-header');
let cleanCSS = require('gulp-clean-css');
let rename = require("gulp-rename");
let uglify = require('gulp-uglify');
let autoprefixer = require('gulp-autoprefixer');
let pkg = require('./package.json');
let sourcemaps = require('gulp-sourcemaps');
let browserSync = require('browser-sync').create();

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', (done) => {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'))

  // Font Awesome
  gulp.src([
      './node_modules/@fortawesome/**/*',
    ])
    .pipe(gulp.dest('./vendor'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'))

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery.easing'))

  done()
});

// Compile SCSS
gulp.task('css-compile', () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header('', {
      pkg: pkg
    }))
    .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css-minify', gulp.series('css-compile', () => {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}));

// CSS
gulp.task('css', gulp.series('css-compile', 'css-minify'));

// Minify JavaScript
gulp.task('js-minify', () => {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', gulp.parallel('js-minify'));

// Default task
gulp.task('default', gulp.parallel('css', 'js', 'vendor'));

// Configure the browserSync task
gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task('dev', gulp.parallel('vendor', 'css', 'js', 'browserSync', (done) => {
  gulp.watch('./scss/*.scss', gulp.parallel('css'));
  gulp.watch('./js/*.js', gulp.parallel('js'));
  gulp.watch('./*.html', browserSync.reload);
}));
