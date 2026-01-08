const gulp = require('gulp'); // Главный инструмент.
const fileInclude = require('gulp-file-include'); // Позволяет вставлять файлы в HTML.
const sass = require('gulp-sass')(require('sass')); // Компилирует SCSS → CSS.
const sassGlob = require('gulp-sass-glob'); // Разрешает писать глобальные импорты SCSS:
const server = require('gulp-server-livereload'); // Поднимает локальный сервер и делает автообновление страницы
const clean = require('gulp-clean'); // Удаляет файлы/папки (обычно папку dist перед сборкой).
const fs = require('fs'); // Node.js модуль для работы с файлами: чтение, запись, проверка наличия файла.
const sourceMaps = require('gulp-sourcemaps'); // Создаёт sourcemap-файлы, чтобы DevTools показывал исходный SCSS/JS, а не минифицированный код.
const plumber = require('gulp-plumber'); // Не даёт Gulp упасть при ошибке. Сборка продолжает работать даже если возникла ошибка в SCSS, HTML, JS.
const notify = require('gulp-notify'); // Показывает красивые всплывающие уведомления при ошибках. Работает в связке с plumber.
const webpack = require('webpack-stream'); // Позволяет использовать Webpack внутри Gulp. Обычно нужен для сборки JavaScript модулей.
const babel = require('gulp-babel'); // Транспилирует современный JS → старый JS, который работает в старых браузерах.
const imagemin = require('gulp-imagemin'); // Оптимизирует картинки: .png, .jpg, .svg, .gif
const changed = require('gulp-changed'); // Пропускает только те файлы, которые были изменены. Ускоряет сборку картинок или HTML.
const typograf = require('gulp-typograf'); // Автоматически приводит текст к типографическим нормам
const svgsprite = require('gulp-svg-sprite'); // Создаёт один спрайт из набора SVG и генерирует стили.
const replace = require('gulp-replace'); // Позволяет делать массовую замену текста в файлах, например:
const webpHTML = require('gulp-webp-retina-html'); // Добавляет webp-изображения в HTML (вставляет теги <picture> с webp и retina).
const imageminWebp = require('imagemin-webp'); // Плагин для imagemin, который делает .webp версии изображений.
const rename = require('gulp-rename'); // Переименовывает файлы, например для минификации:
const prettier = require('@bdchauvette/gulp-prettier'); // Форматирует HTML, CSS и JS по правилам Prettier.

// ✅ ДОБАВЛЕНО — новый современный сервер
const browserSync = require("browser-sync").create();


gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./build/')) {
		return gulp
			.src('./build/', { read: false })
			.pipe(clean({ force: true }));
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

gulp.task('html:dev', function () {
	return gulp
		.src([
			'./src/html/**/*.html',
			'!./**/blocks/**/*.*',
			'!./src/html/docs/**/*.*',
		])
		.pipe(changed('./build/', { hasChanged: changed.compareContents }))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		.pipe(
			replace(/<img(?:.|\n|\r)*?>/g, function(match) {
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
				htmlEntity: { type: 'digit' },
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
		.pipe(gulp.dest('./build/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

gulp.task('sass:dev', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./build/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(
			replace(
				/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1$2$3$4$6$1'
			)
		)
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./build/css/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

gulp.task('images:dev', function () {
	return (
		gulp
			.src(['./src/img/**/*', '!./src/img/svgicons/**/*'])
			.pipe(changed('./build/img/'))
			.pipe(
				imagemin([
					imageminWebp({
						quality: 85,
					}),
				])
			)
			.pipe(rename({ extname: '.webp' }))
			.pipe(gulp.dest('./build/img/'))
			.pipe(gulp.src(['./src/img/**/*', '!./src/img/svgicons/**/*']))
			.pipe(changed('./build/img/'))
			.pipe(gulp.dest('./build/img/'))
			.pipe(browserSync.stream()) // ✅ ДОБАВЛЕНО
	);
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
					js2svg: { indent: 4, pretty: true },
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
					js2svg: { indent: 4, pretty: true },
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

gulp.task('svgStack:dev', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./build/img/svgsprite/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

gulp.task('svgSymbol:dev', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./build/img/svgsprite/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

gulp.task('files:dev', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./build/files/'))
		.pipe(gulp.dest('./build/files/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./build/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./build/js/'))
		.pipe(browserSync.stream()); // ✅ ДОБАВЛЕНО
});

const serverOptions = {
	livereload: true,
	open: true,
};

// ⚠️ твой старый сервер — НЕ УДАЛЯЮ, как просил
// gulp.task('server:dev', function () {
//     return gulp.src('./build/').pipe(server(serverOptions));
// });

// ✅ НОВЫЙ рабочий сервер
gulp.task("server:dev", function (done) {
	browserSync.init({
		server: {
			baseDir: "./build"
		},
		port: 8000,
		notify: false,
		open: true
	});
	done();
});


gulp.task('watch:dev', function () {
	gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch(['./src/html/**/*.html', './src/html/**/*.json'], gulp.parallel('html:dev'));
	gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
	gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
	gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
	gulp.watch('./src/img/svgicons/*', gulp.series('svgStack:dev', 'svgSymbol:dev'));

	return Promise.resolve(); // ✅ ДОБАВЛЕНО, чтобы Gulp НЕ ругался
});
