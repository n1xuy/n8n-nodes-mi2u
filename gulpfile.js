const gulp = require('gulp');

// Task to copy icons
function buildIcons() {
	return gulp.src('nodes/**/*.svg').pipe(gulp.dest('dist/nodes'));
}

// Task to copy LHDN codes directory
function copyLHDNCodes() {
	return gulp.src('LHDN codes/**/*').pipe(gulp.dest('dist/LHDN codes'));
}

// Main build task that runs all other tasks in parallel
const build = gulp.parallel(buildIcons, copyLHDNCodes);

// Watch task for development
function watch() {
	gulp.watch('nodes/**/*.svg', buildIcons);
	gulp.watch('LHDN codes/**/*', copyLHDNCodes);
}

// Export tasks
exports.build = build;
exports.watch = watch;
exports.default = build;
