// Manage Parallax
// Manage the parallax plugin across the site
// --------------------------------------------------
define(['helpers', 'parallax', 'metrics'], function(helper, parallax, metric) {

    // The breakpoint of the large parallax layout
    // This is used to decide the correct origin
    var large_format_breakpoint = window.matchMedia(metric.cache.screen_width.min_lg),

        // Cache some objects..
        $scene = $('.js__parallax'),
        $layers = $scene.find('.layer'),

        enable_breakpoint,

        effects_active,

        // Flag for storing initialized status
        parallax_initialized,

        ev_ns = 'parallax_scroll_check';

    // Configure breakpoints for parallax initialization
    // --------------------------------------------------
    function getParallaxBreakpoint() {

        // Get the type of scene
        // This is used to decide how to configure the parallax instance
        var type = $scene.data('parallax-config');

        // Check data attribute for a specific string and create a media query object for the required breakpoint if supplied
        // This ultimately decides when to enable / disable the effect based on screen size
        if (type === 'hero' || type === 'error') {
            enable_breakpoint = window.matchMedia(metric.cache.screen_width.min_sm);

        // Otherwise just set it to false which will mean parallax is always active
        } else {
            enable_breakpoint = false;
        }
    }

    // Enable parallax effects
    // --------------------------------------------------
    function enable() {

        // Run initialization if not already spun up
        if(!parallax_initialized) {
            $scene.parallax({
                relativeInput: true,
                clipRelativeInput: true,
                scalarX: 2,
                scalarY: 1
            });

            // Set flag
            parallax_initialized = true;

        // If previously initialized then enable the previous instance
        } else {
            $scene.parallax('enable');
        }

        effects_active = true;
    }

    // Disable parallax effects
    // --------------------------------------------------
    function disable() {

        // Run only if instance exists
        if (parallax_initialized) {

            $scene.parallax('disable');

            // Reset layers to their original positions
            $layers.css('transform', '');
        }

        effects_active = false;
    }

    // Disable parallax if the hero scene leaves the viewport
    // Because the hero element is sometimes fixed position it would be bad for performance to keep it active when not visible
    // --------------------------------------------------
    function checkScrollPos() {
        
        var scroll_pos = metric.cache.scroll_pos,
            hero_height = metric.cache.hero_height;

        if (metric.cache.scroll_pos > hero_height && effects_active) {
            disable();

        } else if (metric.cache.scroll_pos < hero_height && !effects_active) {
            enable();
        }
    }

    // Bind
    // --------------------------------------------------
    function bindEvents() {

        // Scrolling
        helper.manageEvent({
            event: 'scroll',
            ev_ns: ev_ns,
            callback: function() {
                checkScrollPos();
            }
        });
    }

    // Unbind
    // --------------------------------------------------
    function unbindEvents() {
        metric.$c.window.off('scroll.' + ev_ns);
    }

    // Checks a media query list to determine whether to activate or deactivate effects
    // --------------------------------------------------
    function checkBreakpoint(mediaQueryList) {

        if (mediaQueryList.matches) {
            enable();
            bindEvents();

        } else {
            disable();
            unbindEvents();
        }
    }

    // Alter the origin between the larger "Mascot" scene and the smaller "Crest" layout
    // --------------------------------------------------
    function changeOrigin(format_mql) {

        if (format_mql.matches && parallax_initialized) {

            // "Mascot" scene
            // Origin weighted to the left of the viewport
            $scene.parallax('origin', 0.0, 0.4);
        } else if (parallax_initialized) {

            // "Crest" scene
            // Origin starts from center of the viewport
            $scene.parallax('origin', 0.5, 0.5);
        }
    }

    // Init
    // --------------------------------------------------
    function init() {

        // Configure parallax breakpoint
        getParallaxBreakpoint();

        // Check if a breakpoint is defined and bind handlers if needed
        if(enable_breakpoint && Modernizr.touchevents) {

            // Run check
            checkBreakpoint(enable_breakpoint);

            // Add listener on media list to fire on change
            enable_breakpoint.addListener(function (mediaQueryList) {
                checkBreakpoint(mediaQueryList);
            });
            

        // Otherwise just enable and bind
        } else {
            enable();
            bindEvents();
        }

        // Add origin settings
        changeOrigin(large_format_breakpoint);

        // Add listener to repeat the origin check at the specified breakpoint/s
        large_format_breakpoint.addListener(function (mediaQueryList) {
            changeOrigin(mediaQueryList);
        });
    }

    // Only initialize if 3d transforms are supported (For performance)
    if(Modernizr.csstransforms3d) {
        init();
    }

    // Public
    // --------------------------------------------------
    return {
        enable: enable,
        disable: disable
    };
});