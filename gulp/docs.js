const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const changed = require('gulp-changed');
const typograf = require('gulp-typograf');
const svgsprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');
const webpHTML = require('gulp-webp-retina-html');
const imagemin = require('gulp-imagemin');
const imageminWebp = require('imagemin-webp');
const rename = require('gulp-rename');
const prettier = require('@bdchauvette/gulp-prettier');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');

const browserSync = require('browser-sync').create();

gulp.task('clean:docs', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp
			.src('./docs/', {read: false})
			.pipe(clean({force: true}));
	}
	done();
});

const fileIncludeSetting = {
	prefix: '@@',
	basepath: '@file',
};

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html:docs', function () {
	if (!fs.existsSync('./docs/')) {
		fs.mkdirSync('./docs/', {recursive: true});
	}

	fs.writeFileSync('./docs/.nojekyll', '');

	return gulp
		.src(['./src/html/*.html'])
		.pipe(changed('./docs/', {hasChanged: changed.compareContents}))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		.pipe(
			replace(/<img(?:.|\n|\r)*?>/g, function (match) {
				return match.replace(/\r?\n|\r/g, '').replace(/\s{2,}/g, ' ');
			})
		)
		.pipe(
			replace(
				/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1./$4$5$7$1'
			)
		)
		.pipe(
			typograf({
				locale: ['ru', 'en-US'],
				htmlEntity: {type: 'digit'},
				safeTags: [
					['<\\?php', '\\?>'],
					['<no-typography>', '</no-typography>'],
				],
			})
		)
		.pipe(
			webpHTML({
				extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				retina: {
					1: '',
					2: '@2x',
				},
			})
		)
		.pipe(
			prettier({
				tabWidth: 4,
				useTabs: true,
				printWidth: 182,
				trailingComma: 'es5',
				bracketSpacing: false,
			})
		)
		.pipe(gulp.dest('./docs/'))
		.pipe(browserSync.stream());
});

gulp.task('sass:docs', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./docs/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(groupMedia())
		.pipe(
			replace(
				/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1$2$3$4$6$1'
			)
		)
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./docs/css/'))
		.pipe(browserSync.stream());
});

gulp.task('images:docs', function () {
	return gulp
		.src(['./src/img/**/*', '!./src/img/svgicons/**/*'])
		.pipe(changed('./docs/img/'))
		.pipe(
			imagemin([
				imageminWebp({
					quality: 85,
				}),
			])
		)
		.pipe(rename({extname: '.webp'}))
		.pipe(gulp.dest('./docs/img/'))
		.pipe(gulp.src(['./src/img/**/*', '!./src/img/svgicons/**/*']))
		.pipe(changed('./docs/img/'))
		.pipe(gulp.dest('./docs/img/'))
		.pipe(browserSync.stream());
});

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: {indent: 4, pretty: true},
				},
			},
		],
	},
};

const svgSymbol = {
	mode: {
		symbol: {
			sprite: '../sprite.symbol.svg',
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: {indent: 4, pretty: true},
					plugins: [
						{
							name: 'removeAttrs',
							params: {
								attrs: '(fill|stroke)',
							},
						},
					],
				},
			},
		],
	},
};

gulp.task('svgStack:docs', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:docs')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./docs/img/svgsprite/'))
		.pipe(browserSync.stream());
});

gulp.task('svgSymbol:docs', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:docs')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./docs/img/svgsprite/'))
		.pipe(browserSync.stream());
});

gulp.task('files:docs', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'))
		.pipe(browserSync.stream());
});

gulp.task('js:docs', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'))
		.pipe(browserSync.stream());
});

gulp.task('server:docs', function (done) {
	browserSync.init({
		server: {
			baseDir: './docs',
		},
		port: 8000,
		notify: false,
		open: true,
	});
	done();
});