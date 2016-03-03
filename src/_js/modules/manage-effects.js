// Manage effects
// Enables effect state classes for improving perfromance based on matching criteria
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/nav-toggle'], function(helper, metric, navToggle) {

    // States
    var s = {
            enhanced_effects: 's__enhanced-effects',
            background_effects: 's__background-effects',
            base_effects: 's__base-effects'
        },

        $c = {
            html: $('html')
        },

        // Adv effects breakpoint
        enhanced_breakpoint = window.matchMedia(metric.cache.screen_width.min_sm);


    // Add enhanced effects state if passing conditions
    // --------------------------------------------------
    function checkEffects(mediaQueryList){

        // Add basic effects to all devices
        $c.html.addClass(s.base_effects);

        // Check for touch support and enhance as necessary
        if(Modernizr.touchevents) {

            if (mediaQueryList.matches) {
                $c.html.addClass(s.enhanced_effects);
            } else {
                $c.html.removeClass(s.enhanced_effects);
            }

        } else {

            // Enable all effects
            $c.html.addClass(s.enhanced_effects).addClass(s.background_effects);
        }
    }

    function addListeners() {

        // Add listener on media list to fire on change
        enhanced_breakpoint.addListener(function (mediaQueryList) {
            checkEffects(mediaQueryList);
        });
    }

    // Init
    // --------------------------------------------------
    function init(){
        checkEffects(enhanced_breakpoint);
        addListeners();
    }
   
    init();
    
    // Public
    // --------------------------------------------------
    return {};
});