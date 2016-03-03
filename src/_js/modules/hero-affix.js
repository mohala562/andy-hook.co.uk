// Hero fix
// Decides whether to allow fixing of the hero section
// Also updates the placeholder to match the height of the hero
// --------------------------------------------------
define(['helpers', 'metrics', 'plugins/skrollr'], function(helper, metric, skrollr) {

    // Object cache
    var $c = {
            hero: $('.js__hero'),
            unit: $('.js__hero__unit'),
            placeholder: $('.js__hero__placeholder'),
            critical_content: $('.js__hero__intro'),
            topbar: $('.js__topbar')
        },

        // State classes
        s = {
            hero_fixed: 's__hero-fixed',
            hero_static: 's__hero-static',
            nav_fixed: 's__nav-fixed'
        },

        // Flags for checking validity inside closures

        // Whether there is enough view space to fix the hero
        view_space,

        hero_fixed,

        // Whether the skrollr effects are active or not
        effects_active;

    // Enable skrollr
    // --------------------------------------------------
    function enableSkrollr() {

        // Only initialize if skrollr is not running and 3d transforms are supported
        if (!skrollr.get() && Modernizr.csstransforms3d && !Modernizr.touchevents) {
            skrollr.init({

                // Prevent skrollr applying static height to document (Fix's jank)
                forceHeight: false,

                // Disable mobile device support
                mobileCheck: function(){
                    return false;
                }
            });
        }
    }

    // Disable skrollr
    // --------------------------------------------------
    function disableSkrollr() {

        // Only destroy if a skrollr instance exists..
        if (skrollr.get()) {
            skrollr.get().destroy();

            // Manually remove residual styles
            // Skrollr doesn't seem to do this already..
            // TODO: create an issue or investigate why this is the case
            $('.skrollable').removeAttr('style');
        }
    }

    // Fix or unfix the hero
    // --------------------------------------------------
    function applyFixedElements() {

        // Fix hero if view space is available
        if (view_space && !Modernizr.touchevents) {
            metric.$c.body.addClass(s.hero_fixed).removeClass(s.hero_static).addClass(s.nav_fixed);

            hero_fixed = true;

        // Otherwise unfix
        } else {
            metric.$c.body.addClass(s.hero_static).removeClass(s.hero_fixed).removeClass(s.nav_fixed);

            hero_fixed = false;
        }
    }

    // Activate or deactivate skrollr
    // --------------------------------------------------
    function applySkrollr() {

        // Enable if there is view space providing it's not already active
        if (view_space && !effects_active) {

            enableSkrollr();
           
            // Set flag
            effects_active = true;

        // Otherwise disable
        } else if (!view_space && effects_active) {

            disableSkrollr();
            
            // Set flag
            effects_active = false;
        }
    }

    // Compare view port size with hero size and set a flag to say whether there is space available for fixing / effects
    // --------------------------------------------------
    function checkAvailableSpace(){

        var window_height = metric.cache.window_height,
            content_height = $c.critical_content.outerHeight();

        // Set a flag depending on whether there critical content is visible..
        if (window_height > content_height) {
            view_space = true;
        } else {
            view_space = false;
        }

        // Attempt to apply skrollr if accelerated transforms are available
        // (For performance reasons it's not worth running it in a legacy way although it is supported by skrollr at this time)
        if (Modernizr.csstransforms3d && !Modernizr.touchevents) {
            applySkrollr();
        }

        // Attempt to fix the hero element
        applyFixedElements();
    }

    // Sync heights between the hero and placeholder
    // --------------------------------------------------
    function syncHeight() {

        var hero_height = metric.cache.hero_height,
            placeholder_height = metric.cache.hero_placeholder_height;

        // Check if heights match, if not then make them equal
        if (placeholder_height !== hero_height) {
            $c.placeholder.height(hero_height);
        }
    }

    // Update initial placeholder height
    // --------------------------------------------------
    function setInitialHeight() {
        var hero_height = metric.cache.hero_height;

        $c.placeholder.height(metric.cache.hero_height);
    }

    // Refresh skrollr
    // Though skrollr has an in built update function for resize I use the public method and do my own refresh on resize
    // Ensures better accuracy and control from my own resize event
    // --------------------------------------------------
    function refreshSkrollr() {
        skrollr.get().refresh();
    }

    // Resync after fonts have loaded
    // --------------------------------------------------
    function syncAfterFontLoad() {

        var timerId = 0,
            freq = 50,
            $html = $('html');

        // Run every internal 
        timerId = setInterval(function(){

            if($html.hasClass('wf-active')) {
                syncHeight();
                clearInterval(timerId);
            }

        }, freq);
    }

    // Binding
    // --------------------------------------------------
    function bindEvents() {

        // Resize
        helper.manageEvent({
            freq: 10,

            callback: function() {
                syncHeight();
                checkAvailableSpace();

                if (skrollr.get()) {
                    refreshSkrollr();
                }
            }
        });
    }

    // Returns view space boolean for use in other modules
    // --------------------------------------------------
    function getStatus() {
        return {
            has_space: view_space,
            is_fixed: hero_fixed
        };
    }

    // Init
    // --------------------------------------------------
    function init() {

        // Initial height must be set before skrollr is initialized
        setInitialHeight();

        // Resync hero and placeholder after fonts have loaded
        syncAfterFontLoad();

        // Bind events
        bindEvents();

        // Run checks for skrollr and fixing
        // Also allows the viewspace boolean to be returned and present
        checkAvailableSpace();
    }
    
    init();

    return {
        status: getStatus
    };
});