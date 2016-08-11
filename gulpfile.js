var gulp = require("gulp");
var path = require("path");
var gulpConcat = require('gulp-concat');
var gulpClean = require('gulp-clean-dest');
var bowerMain = require('bower-main');

var rootPath = path.join(__dirname , "bower_components/");
gulp.task("copy:css" , function(){
    var destPath = path.join(__dirname , "public/css");
    gulp.src([
        path.join(rootPath , "bootstrap/dist/css/bootstrap.css"),
        path.join(rootPath , "font-awesome/css/font-awesome.css")
    ])  .pipe(gulpConcat('main.css'))
        .pipe(gulpClean(destPath))
        .pipe(gulp.dest(destPath))

});
 gulp.task("copy:font" , function(){
     gulp.src([
         path.join(rootPath , "font-awesome/fonts/*.*")
     ]).pipe(gulp.dest(path.join(__dirname , "public/fonts")))
 });

gulp.task("copy:scripts" , function(){
    var bowerMainJavaScriptFilesObject = bowerMain('js','min.js');
    gulp.src(bowerMainJavaScriptFilesObject.normal)
        .pipe(gulp.dest(path.join(__dirname , "public/scripts")));
});
//gulp.task("copy:Special:scripts" , function(){
//    gulp.src([
//        "bower_components/systemjs-plugin-text/text.js"
//    ])
//        .pipe(gulp.dest(path.join(__dirname , "public/scripts")));
//});



gulp.task("task loader" , ["copy:css" , "copy:font" ,"copy:scripts" ])