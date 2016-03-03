(function () {

    'use strict';

    // Site info
    var site = {
        title: 'Andy Hook',
        description: 'The portfolio of designer and front-end developer Andy Hook',
        url: 'https://andy-hook.github.io/'
    };

    // Manually require modules that won"t get picked up by gulp-load-plugins
    var gulp = require('gulp'),
        es = require('event-stream'),
        fs = require('fs'),
        path = require('path'),
        del = require('del'),
        runSequence = require('run-sequence'),
        argv = require('yargs').argv,

        // Prod environment variable
        prod_env = (argv.prod_env === 'true') ? true : false,
        dev_site_path = 'http://192.168.0.15:8080/andy-hook-metalsmith/build/',
        prod_site_path = site.url;

    // Load plugins
    var plugins = require('gulp-load-plugins')({camelize: true});

    // Load browsersync
    var browserSync = require('browser-sync'),
        reload = browserSync.reload;

    // Useful file paths
    var paths = {

        // General
        src: 'src',
        build: 'build',

        // Assets
        assets: 'assets',
        img: 'assets/img',
        svg: '_svg',
        js: '_js',
        scss: '_scss',
        work: '_work',

        // Templating
        templates: '_templates',
        partials: '_partials',
    };

    // Output to a public folder if building for production
    if (prod_env) {
        paths.build = 'public';
    }

    // Task - build-site
    // Main site building task, uses metalsmith to render out static site
    // --------------------------------------------------
    gulp.task('build-site', function() {

        var Handlebars    = require('handlebars'),
            markdown      = require('metalsmith-markdown'),
            templates     = require('metalsmith-templates'),
            ignore        = require('metalsmith-ignore'),
            permalinks    = require('metalsmith-permalinks'),
            collections   = require('metalsmith-collections'),
            minifyHTML    = require('metalsmith-html-minifier'),
            msIf          = require('metalsmith-if'),
            glob          = require('glob'),
            copyAssets = require('metalsmith-copy-assets-540');

        var Metalsmith    = require('metalsmith');

        // Register HB partials via file name
        function registerPartials() {

            // Complete paths
            var partial_path = paths.src + '/' + paths.templates + '/' + paths.partials + '/',
                svg_path = paths.src + '/' + paths.svg + '/output/',

                // Scans and loops through partials directory
                layout_partials = {},
                svg_partials = {},

                // Scan for partials
                partialPaths = glob.sync(partial_path + '/*'),
                svgPaths = glob.sync(svg_path + '/*');

            // Loop over paths
            for (var i = 0; i < partialPaths.length; i++) {

                var partialName = path.basename(partialPaths[i], '.hbs');

                // Fill partials object
                layout_partials[partialName] = partialPaths[i];
            }

            for (var i = 0; i < svgPaths.length; i++) {

                var svgName = path.basename(svgPaths[i], '.svg');

                // Fill partials object
                svg_partials[svgName] = svgPaths[i];
            }

            // Loop through and register partials

            // Layout
            for (var partial in layout_partials) {
                Handlebars.registerPartial(partial, fs.readFileSync(layout_partials[partial], 'utf8'));
            }

            // Svg
            for (var svg in svg_partials) {
                Handlebars.registerPartial(svg, fs.readFileSync(svg_partials[svg], 'utf8'));
            }

        }


        // Register HB helpers for use in templates
        function registerHelpers() {

            // Make comparisons
            Handlebars.registerHelper('if_eq', function(a, b, options) {
                if(a === b)
                    return options.fn(this);
                else
                    return options.inverse(this);
            });


            // Get the path of the next project
            Handlebars.registerHelper('next_path', function(array, order) {
            
                // If the item is the last in the array then loop back and get the first item path
                if (order === array.length) {
                    return array[0].path;

                }

                // Array counts from 0 while work is ordered from 1 so passing in the value as is will increment
                return array[order].path;
                

            });

            // Get the path of the previous project
            Handlebars.registerHelper('previous_path', function(array, order) {
                
                // If this is the first item then loop back and get the last item path
                if (order === 1) {
                    return array[array.length - 1].path;

                }

                // Decrement by 2 as work count starts at 1 but arrays count from 0
                return array[order - 2].path;
            });

            // Group together sets and output
            Handlebars.registerHelper('grouped_each', function(every, context, options) {

                var out = "",
                    subcontext = [],
                    i;

                if (context && context.length > 0) {
                    for (i = 0; i < context.length; i++) {

                        if (i > 0 && i % every === 0) {
                            out += options.fn(subcontext);
                            subcontext = [];
                        }

                        subcontext.push(context[i]);
                    }

                    out += options.fn(subcontext); 
                }

                return out;
            });


            // Get the filename from a supplied url
            Handlebars.registerHelper('get_filename', function (url) {
                return url.substr(url.lastIndexOf('/') + 1);
            });

            /**
             * Determine whether a number is in the pattern 1 4 5 8 9 12 13 16 17...
             * Used to check the project position and set it as featured
             *
             * @param {int} x Number to test
             * @return {bool}
             */
            Handlebars.registerHelper('if_featured_thumb', function(x, options) {

                if (x % 4 <= 1) {
                    return options.fn(this);
                }

                return options.inverse(this);
            });

            // Generate absolute urls
            Handlebars.registerHelper('absolute_path', function (url) {

                if (prod_env) {
                    return prod_site_path + url;
                }

                return dev_site_path + url;
            });
        }

        function build() {

            new Metalsmith(__dirname)
            
                // Disable default metalsmith directory cleaning
                .clean(false)

                //Additional global data
                .metadata({

                    // Production environment
                    'prod': prod_env,

                    // Site info
                    'site-title': [ site.title ],
                    'site-description': [ site.description ]
                })

                // Get each piece of work and store in an array for use in templates
                // Use "collection" metadata inside markdown files rather than by pattern to avoid odd sort bugs
                .use(collections({
                    work: {
                        sortBy: 'order'
                    }
                }))

                // Ignore readme
                .use(ignore([
                    'README.md'
                ]))
               
                // Process markdown
                .use(markdown())

                // Build permalink folder structure
                .use(permalinks({
                    pattern: 'work/:title',
                    relative: true,
                }))

                // Process handlebar templates
                .use(templates({
                    engine: 'handlebars',
                    directory: paths.src + '/' + paths.templates
                }))

                // Ignore folders
                .use(ignore([
                    paths.templates + '/**',
                    paths.work + '/**',
                    paths.js + '/**',
                    paths.scss + '/**',
                    paths.svg + '/**'
                ]))

                // Minify html
                .use(msIf(prod_env, minifyHTML()))

                // Copy readme file
                .use(copyAssets({
                	src: 'src/README.md'
                }))

                .destination(paths.build)

                .build(function (err) {
                    if (err) {
                      console.log(err);
                    }
                    else {
                      console.log('Site build complete!');
                    }
                });
        }

        // Register partials
        registerPartials();

        // Register helpers
        registerHelpers();

        // Build site
        build();
    });

    // Task - js
    // Build js using r.js optimizer and almond then place in the build folder
    // Bundles almond.js into the production build in place of require
    // See https://github.com/jrburke/almond
    // --------------------------------------------------
    gulp.task('optimize-js', plugins.shell.task([
        'node node_modules/requirejs/bin/r.js -o mainConfigFile=src/_js/config.js include=main preserveLicenseComments=false insertRequire=main out=' + paths.build +'/assets/js/script.min.js',
        'node node_modules/requirejs/bin/r.js -o mainConfigFile=src/_js/config.js include=error preserveLicenseComments=false insertRequire=error out=' + paths.build + '/assets/js/error.min.js'
    ]));

    // Task - modernizr
    // Minify modernizr and place into lib directory
    // --------------------------------------------------
    gulp.task('js-libs', function () {

        // Modernizr
        gulp.src(paths.src + '/' + paths.js + '/conditional/modernizr.custom.js')
            .pipe(plugins.concat('modernizr.min.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(paths.build + '/assets/js/conditional'))

            // Browser sync
            .pipe(reload({stream: true}));

        // Local jquery
        gulp.src([
            paths.src + '/' + paths.js + '/conditional/jquery.2.1.4.js'
        ])
            .pipe(plugins.concat('jquery.2.1.4.min.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(paths.build + '/assets/js/conditional'));
    });

    // Task - scss
    // Compile SCSS, autoprefix, group media queries and minify
    // --------------------------------------------------
    gulp.task('scss', function () {

        gulp.src(paths.src + '/' + paths.scss + '/main.scss')

            // Process Sass
            .pipe(plugins.sass().on('error', plugins.sass.logError))

            // Combine media queries
            .pipe(plugins.groupCssMediaQueries())

            // Autoprefix
            .pipe(plugins.autoprefixer({ browsers: ['last 2 version', 'IE 9', 'IOS 6']}))

            // Minify css
            .pipe(plugins.if(prod_env,plugins.minifyCss()))

            // Rename the file
            .pipe(plugins.rename({
                basename: 'style',
                suffix: '.min'
            }))

            // Move it into the css folder
            .pipe(gulp.dest(paths.build + '/assets/css'))

            // Browser sync
            .pipe(reload({stream: true}));

        gulp.src(paths.src + '/' + paths.scss + '/error.scss')

            // Process Sass
            .pipe(plugins.sass().on('error', plugins.sass.logError))

            // Combine media queries
            .pipe(plugins.groupCssMediaQueries())

            // Autoprefix
            .pipe(plugins.autoprefixer({ browsers: ['last 2 version', 'IE 9', 'IOS 6']}))
            
            // Minify css
            .pipe(plugins.if(prod_env,plugins.minifyCss()))

            // Rename the file
            .pipe(plugins.rename({
                basename: 'error',
                suffix: '.min'
            }))

            // Move it into the css folder
            .pipe(gulp.dest(paths.build + '/assets/css'))

            // Browser sync
            .pipe(reload({stream: true}));
    });

    // Task - svg
    // Combine all SVGs in svg into a single spritesheet, with each symbol ID matching the source filename
    // --------------------------------------------------
    gulp.task('svg', function () {

        var svg_path = paths.src + '/' + paths.svg + '/';

        // Standard single items
        gulp.src(svg_path + 'individual/**/*.svg')

            //Minify but leave ID's alone
            .pipe(plugins.svgmin({
                plugins: [
                    {cleanupIDs: false},
                    {removeDoctype: true},
                    {removeXMLProcInst: true}
                ]
            }))

            // Remove clutter at head of document
            .pipe(plugins.replace(/^.*\n.*\n/, ''))

            .pipe(plugins.replace('id=', 'class='))

            // Store file
            .pipe(gulp.dest(svg_path + '/output/'));


        // Compile hand coded svgs
        gulp.src(svg_path + 'custom/**/*.svg')

            // Minify but leave ID's alone
            .pipe(plugins.svgmin({
                plugins: [
                    {cleanupIDs: false},
                    {removeDoctype: true},
                    {removeXMLProcInst: true}
                ]
            }))

            // Remove clutter at head of document
            .pipe(plugins.replace(/^.*\n.*\n/, ''))

            // Store file
            .pipe(gulp.dest(svg_path + '/output/'));

        // Compile into spritesheet
        gulp.src(svg_path + 'sprite/*.svg')

            // Remove clutter at head of document
            .pipe(plugins.replace(/^.*\n.*\n/, ''))

             //Minify but leave ID's alone
            .pipe(plugins.svgmin())

            // Compile to spritesheet
            .pipe(plugins.svgstore({ inlineSvg: true }))

            // Add class for hiding the spritesheet
            .pipe(plugins.replace('<svg', '<svg class="spritesheet"'))

            // // Rename the file
            .pipe(plugins.rename({
                basename: 'spritesheet'
            }))

            .pipe(gulp.dest(svg_path + '/output/'));
    });

    // Task - Full build
    // Build static site and compile optimized javascript
    // --------------------------------------------------
    gulp.task('full-build', function(){

        // Clean build directory and fire callback function
        del(paths.build + '/**/*', function(){

            if (prod_env) {

                // Wait for r.js to run fully before running remaining asset tasks
                runSequence('optimize-js', ['scss', 'js-libs', 'build-site']);

            } else {
                runSequence('scss', 'js-libs', 'build-site');
            }
        });
        
    });

    // Task - Serve
    // Start up browsersync server and watch files
    // --------------------------------------------------
    gulp.task('serve', function() {

        browserSync({
            proxy: '192.168.0.15:8080/andy-hook-metalsmith/build',
            open: false,
            notify: false
        });

        // Watch SCSS
        gulp.watch([paths.src + '/' + paths.scss + '/**/*'], ['scss']);

        // Watch SVG
        gulp.watch([paths.src + '/' + paths.svg + '/sprite/*.svg', paths.src + '/' + paths.svg + '/custom/*.svg'], ['svg']);

        // Watch js libs
        gulp.watch([paths.src + '/' + paths.js + '/conditional/*.js'], ['js-libs']);

        // Watch template files and rebuild site
        gulp.watch([
            paths.src + '/**/*.hbs',
            paths.src + '/**/*.md',
            paths.src + '/**/*.html',
            paths.src + '/' + paths.svg + '/output/*.svg',
            paths.src + '/' + paths.assets + '/**/*',
            paths.src + '/' + paths.work + '/**/*'

            ], ['build-site']);

        // Watch changes and reload
        gulp.watch([paths.src + '/' + paths.js + '/**/*', paths.build + '/' + 'index.html']).on('change', reload);
    });

    // Task - Build & serve
    // Run a full dev build and launch serve
    // --------------------------------------------------
    gulp.task('build-serve', function() {
        runSequence('full-build', ['serve']);
    });
}());

