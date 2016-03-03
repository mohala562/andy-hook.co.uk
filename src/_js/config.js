// Config - Configure requirejs and build options
// --------------------------------------------------
requirejs.config({
    name: 'lib/almond',
    findNestedDependencies: true,
    wrap: true,

    paths: {

      // Note: This is not the actual library, rather a reference to jQuery so that require can see the depedency order
      jquery: 'lib/jquery',

      // This path is changed at build time to declare jquery available, it is then loaded separately as wordpress needs to manage it
      modernizr: 'lib/modernizr',

      // Shimmed lib paths
      easing: 'plugins/easing',
      parallax: 'plugins/parallax',
      smoothScroll: 'plugins/smoothscroll',

      // Global variables and helper functions
      helpers: 'modules/helpers',

      // Common metrics
      metrics: 'modules/common-metrics'
    },

    // Shim these libraries to add AMD support
    shim: {
        easing: {
            deps: ['jquery'],
            exports: 'easing'
        },

        parallax: {
            deps: ['jquery'],
            exports: 'parallax'
        },

        smoothScroll: {
            exports: 'smoothScroll'
        }
    }
});