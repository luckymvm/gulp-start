const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass')),
      concat = require('gulp-concat'),
      browserSync = require('browser-sync').create(),
      autoPrefixer = require('gulp-autoprefixer'),
      imageMin = require('gulp-imagemin'),
      del = require('del'),
      uglify = require('gulp-uglify-es').default;

function browser() {
    browserSync.init ({
        server: {
            baseDir: 'src/'
        },
        port: 1337
    });
}

function scripts() {
    return src([
        'src/assets/scripts/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('src/assets/scripts'))
        .pipe(browserSync.stream())
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('src/assets/img/**/*')
    .pipe(imageMin([
        imageMin.gifsicle({interlaced: true}),
        imageMin.mozjpeg({quality: 75, progressive: true}),
        imageMin.optipng({optimizationLevel: 5}),
        imageMin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/assets/img'))
}

function styles() {
    return src('src/scss/main.scss')
        .pipe(scss({outputStyle: 'expanded'}))
        .pipe(concat('main.min.css'))
        .pipe(autoPrefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'src/css/main.min.css',
        'src/css/normalize.css',
        'src/assets/fonts/**/*',
        'src/*.html'
    ], {base: 'src'})
        .pipe(dest('dist'))
}

function watching() {
    watch(['src/scss/**/*.scss'], styles);
    watch(['src/assets/scripts/**/*.js', '!src/assets/scripts/main.min.js'], scripts);
    watch(['src/**/*']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browser = browser;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(scripts, styles, watching, browser);