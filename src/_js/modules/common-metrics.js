// Common metrics
// Get and store common metrics and variables
// This is an experiment to see how performance can be improved by caching very common objects / metrics
// --------------------------------------------------
define(['helpers', 'plugins/throttle-debounce'], function(helper, throttle_debounce) {
      
    // Add active state support for IOS
    if (/iP(hone|ad)/.test(window.navigator.userAgent)) {
      document.body.addEventListener('touchstart', function () {}, false);
    }

    // Commen metrics
    var metrics = {},
        ev_ns = 'page_metrics',

        // Object cache
        $c = {
            window: $(window),
            body: $('body'),
            document: $(document),
            topbar: $('.js__topbar'),
            hero: $('.js__hero'),
            hero_unit: $('.js__hero__unit'),
            hero_placeholder: $('.js__hero__placeholder'),
            project: $('.js__project'),
            work: $('.js__work')
        };

    // Common variables
    // --------------------------------------------------

    // Project container used for injecting html with pjax
    // IE11 has an issue with using a classname for the container, used ID to work around the issue
    metrics.project_container = '#project';

    // Screen width media queries
    // TODO: Find a way to gather this information from the dom rather than using static values
    metrics.screen_width = {
        min_xs: '(min-width: 480px)',
        min_sm: '(min-width: 768px)',
        min_md: '(min-width: 1000px)',
        min_lg: '(min-width: 1200px)',
        min_xl: '(min-width: 1400px)',
        min_max: '(min-width: 1635px)',

        max_xs: '(min-width: 479px)',
        max_sm: '(min-width: 767px)',
        max_md: '(min-width: 999px)',
        max_lg: '(min-width: 1199px)',
        max_xl: '(min-width: 1399px)',
        max_max: '(min-width: 1634px)'
    };

    // Add additional screen widths after object construction
    metrics.screen_width.format_shift = metrics.screen_width.min_lg;

    // The media query list for the nav change breakpoint
    metrics.nav_break_mql = window.matchMedia(metrics.screen_width.min_lg);

    // UA and version results
    metrics.ua = {};

    // Set / get top bar height
    // --------------------------------------------------
    function updateTopbarHeight() {

        if($c.topbar.length) {

            var current_height = $c.topbar.height(),
                current_outer_height = $c.topbar.outerHeight();

            // Workaround for polling the bar when it is expanded in the mobile format
            // Will disregard any value higher than an arbitrary amount, this is because it should only be polled when in the smaller format
            // TODO: This is NOT a robust solution
            if (current_outer_height > 150 || current_height > 150) {
                return;
            }

            // Update metrics
            if(current_height !== metrics.topbar_height) {
                metrics.topbar_height = current_height;
            }
            
            if(current_outer_height !== metrics.topbar_outer_height) {
                metrics.topbar_outer_height = current_outer_height;
            }
            
        }
    }

    // On resize
    // --------------------------------------------------
    function getOnResize() {

        // Get top bar height
        updateTopbarHeight();

        // Get top bar clearance
        if($c.topbar.length) {
            metrics.topbar_clearance = parseInt($c.topbar.css('padding-top'),10);
        }

        // Get hero and placeholder height
        if($c.hero.length) {
            metrics.hero_height = $c.hero.outerHeight();
        }

        if($c.hero_placeholder.length) {
            metrics.hero_placeholder_height = $c.hero_placeholder.outerHeight();
        }

        // Viewport height
        metrics.window_height = $(window).outerHeight();

        // Get project offset and height
        if($c.project.length) {
            // Project offset (top)
            metrics.project_offset_top = $c.project.offset().top;

            // Project height
            metrics.project_height = $c.project.outerHeight();
        }

        // Window width
        metrics.window_width = $(window).width();

        // Window height
        metrics.window_height = $(window).height();
    }

    // On scroll
    // --------------------------------------------------
    function getOnScroll() {

        // Scroll position
        metrics.scroll_pos = $(window).scrollTop();
    }

    // Binding
    // --------------------------------------------------
    function bindEvents() {

        // Resize
        helper.manageEvent({
            event: 'resize',
            callback: function() {
                getOnResize();
            }
        });

        // Scroll
        helper.manageEvent({
            event: 'scroll',
            callback: function() {
                getOnScroll();
            }
        });
    }

    // UA and version tests
    // --------------------------------------------------
    function getUA() {

        // IE9
        if ($('html').hasClass('ie9')) {
            metrics.ua.ie9  = true;
        }

        // IOS
        if (/iP(hone|ad)/.test(window.navigator.userAgent)) {
            metrics.ua.ios = /iP(hone|ad)/.test(window.navigator.userAgent);
        }
    }

    // For an update of object metrics
    // --------------------------------------------------
    function forceUpdate() {
        getOnResize();
    }

    // Add a metric to the cache
    // --------------------------------------------------
    function addMetric(metric_name, value) {

        // Add prop to obj
        metrics[metric_name] = value;
    }

    // Init
    // --------------------------------------------------
    function init(){
        getOnResize();
        getOnScroll();
        bindEvents();
        getUA();
    }
    
    init();
    
    // Public
    // --------------------------------------------------
	return {
        forceUpdate: forceUpdate,
        cache: metrics,
        addMetric: addMetric,
        $c: $c
    };
});