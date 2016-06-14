'use strict';

// Client
let gulp = require('gulp')
let sass = require('gulp-sass')
let del = require('del')

let jsPaths = ['client/dev/*.js']
let htmlPaths = ['client/dev/*.html']
let scssPaths = ['client/dev/scss/*.scss']
let output = __dirname + '/client/public/'

gulp.task('del-public', () => {
  del.sync([output + '*'])
})

gulp.task('sass', () => {
  del.sync([output + 'css'])
  gulp.src(scssPaths)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(output + 'css'))
})

gulp.task('copy-js', () => {
  del.sync([output + 'js'])
  gulp.src(jsPaths)
    .pipe(gulp.dest(output + 'js'))
})

gulp.task('copy-html', () => {
  del.sync([output + '*.html'])
  gulp.src(htmlPaths)
    .pipe(gulp.dest(output))
})

gulp.task('copy-public', ['sass', 'copy-js', 'copy-html'])

gulp.task('watch', () =>{
  gulp.watch(scssPaths, ['sass'])
  gulp.watch(jsPaths, ['copy-js'])
  gulp.watch(htmlPaths, ['copy-html'])
})

// Universal
gulp.task('default', ['copy-public', 'watch'])
