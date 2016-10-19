var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

gulp.task('build', function() {
    return gulp.src('../../src/autoSelector.js')
        .pipe(gulp.dest('../../dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({compress: false}).on('error', gutil.log))
        .pipe(gulp.dest('../../dist'));
});
