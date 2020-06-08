"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

//таска для работы с HTML-файлами
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

//таска для работы с SCSS-файлами
gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

//таска для создания svg-спрайта
gulp.task("sprite", function () {
  return gulp.src("source/img/sprite/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
});

//таска для минификации изображений png,jpg,svg (Включена в первую команду для разработки, при добавлении картинки нужно запустить отдельно команду "gulp images", если ее нужно минифицировать)
gulp.task("images", function () {
  return gulp.src(["source/img/**/*.{png,jpg,svg}", "!source/img/sprite/*.svg"])
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("source/img"));
});

//таска для создания webp-изображений (нужно запустить команду "gulp webp")
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 80}))
  .pipe(gulp.dest("source/img"));
});

//таска для работы с библиотеками(объединяет и минимизирует)
gulp.task("libs", function () {
  return gulp.src(["source/js/libs/*.js", "source/js/polyfill/*.js"])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
});

//таска для работы с js-файлами
gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(sourcemap.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"))
});

//таска переносит файлы в папку build
gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

//удаляет папку build
gulp.task("clean", function () {
  return del("build");
});

//для переноса картинок во вренмя верстки
gulp.task("clean-img", function () {
  return del("build/img");
});
gulp.task("copy-img", function () {
  return gulp.src([
      "source/img/**"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

//локальный сервер
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/img/sprite/*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch(["source/img/**/*.{png,jpg,svg}", "!source/img/sprite/*.svg"], gulp.series("clean-img", "copy-img", "refresh"));
  gulp.watch("source/fonts/**/*.{woff,woff2}", gulp.series("copy", "refresh"));
  gulp.watch(["source/js/libs/*.js", "source/js/polyfill/*.js"], gulp.series("libs", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});
gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "css", "copy", "sprite", "html", "libs", "js"));
gulp.task("start", gulp.series("build", "images", "server"));
