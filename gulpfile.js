const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const data = require('gulp-data');
const nunjucksRender = require('gulp-nunjucks-render');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const runSequence = require('run-sequence');

// Nunjucks
function nuns() {
  return gulp.src('dev/pages/**/*.+(html|njk|nunjucks)')
    .pipe(data(function() {
      return require('./dev/data.json')
    }))
    .pipe(nunjucksRender({
      path: ['dev/templates'],
      envOptions: {autoescape: false}
    }))
    .pipe(gulp.dest('dev'))
}

// Sass
function sassy() {
  return gulp.src('dev/scss/**/*.+(scss|sass)')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ require('cssnano'), require('autoprefixer')]))
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.stream())
}

// watch this!
function watch() {
  browserSync.init({
    server: {
      baseDir: 'dev'
    },
  });
  gulp.watch('dev/scss/**/*.+(scss|sass)', sassy);
  gulp.watch('dev/pages/**/*.+(html|njk|nunjucks)', nuns);
  gulp.watch('dev/templates/**/*.+(html|njk|nunjucks)', nuns);
  gulp.watch('dev/js/**/*.js').on('change', browserSync.reload);
  gulp.watch('dev/*.html').on('change', browserSync.reload);
}

// minify ES6 because uglify is dumb
function uggo() {
  return gulp.src("dev/js/**/*.js")
    .pipe(rename("main.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
}

function refs() {
  return gulp.src('dev/*.html')
    .pipe(useref())
    .pipe(gulp.dest('build'))
}

// add images
function images() {
  return gulp.src('dev/images/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('build/images'))
}

// clean up build
async function clean() {
  del.sync('build');
}

// deletes then create build folder
gulp.task('build', gulp.series(clean, gulp.parallel(uggo,refs,images)));

// default tasks
gulp.task('default', gulp.series(nuns,sassy,watch));
