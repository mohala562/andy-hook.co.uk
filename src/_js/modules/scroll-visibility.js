// Scroll visibility
// Adds visibility classes to sections based on scroll position
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/nav-toggle'], function(helper, metric, navToggle) {

    var scroll_targets = '[data-scroll-visibility]',
        visibility_targets_array = [],
        ev_ns = 'scroll_visibility',

        // States
        s = {
            visible: 's__section-visible',
            hidden: 's__section-hidden'
        },

        $c = {
            html: $('html'),
            scroll_targets: $(scroll_targets)
        },

        dimensions = {},

        // Match against data strings to get the equivalent value
        window_offsets = {},

        // Flag to store forced hidden status
        force_hide;

    // Update window offsets
    function calculateOffsets() {
        window_offsets = {
            'full': metric.cache.window_height,
            'half': metric.cache.window_height / 2
        };
    }

    // Hide / Show sections
    // --------------------------------------------------
    function showSection($target) {
        $target.addClass(s.visible).removeClass(s.hidden);
    }

    // Hide section
    function hideSection($target) {
        $target.addClass(s.hidden).removeClass(s.visible);
    }

    // Looks for an optional data attribute and return the target as a jQuery object if supplied
    // --------------------------------------------------
    function getTarget($target){

        // Get separate target
        var $sep_target = $($target.data('scroll-visibility-target'));

        // Check if it exists and return
        if ($sep_target.length) {
            return $sep_target;

        // Otherwise return the original object
        } else {
            return $target;
        }
    }

    function storeDirection($el){
        var visible_direction = $el.data('scroll-visibility-direction');

        // Store direction
        if (visible_direction) {
            $el.data('direction', visible_direction);
        }
    }

    // Checks position
    // --------------------------------------------------
    function visibilityLogic($el, $target_el) {

        var target_offset_str = $el.data('scroll-visibility'),
            window_offset = window_offsets[target_offset_str],

            // Target distance from top of the document
            target_scrolltop = $el.offset().top,

            // Target height
            target_height = $el.outerHeight(),

            // Start and end points
            section_pos_top = target_scrolltop - window_offset,
            section_pos_bottom = target_height + target_scrolltop - metric.cache.topbar_outer_height;

        if (metric.cache.scroll_pos > section_pos_top && metric.cache.scroll_pos < section_pos_bottom || metric.cache.scroll_pos > section_pos_top && $el.data('direction') !== 'both') {
            showSection($target_el);

        } else if ($el.data('direction') === 'both' && metric.cache.scroll_pos > section_pos_bottom || metric.cache.scroll_pos < section_pos_top) {
            hideSection($target_el);
        }


    }

    // Manages the checking
    function performCheck($el) {

        // Don't execute if a "force hide" is in progress
        if (force_hide === true) return;

        // Get target
        var $target = getTarget($el);

        // If touch device show all sections
        if (Modernizr.touchevents) {
            showSection($target);

            return;
        }

        // Otherwise run checking logic
        visibilityLogic($el, $target);
    }

    // Force visibility
    // Forces the showing and hiding of each section
    // --------------------------------------------------
    function forceHide() {

        // Set status
        force_hide = true;

        // Loop array and hide each element
        $(visibility_targets_array).each(function(){
            hideSection($(this));
        });
    }

    function forceShow() {

        // Set status
        force_hide = false;

        // Loop array and show each element
        $c.scroll_targets.each(function(){
            performCheck($(this));
        });
        
    }

    // Bind
    // --------------------------------------------------
    function bindEvents($target) {

        // Resize
        helper.manageEvent({
            event: 'resize',
            ev_ns: ev_ns,
            callback: function() {

                // Recalculate the offsets so that the values are up to date
                calculateOffsets();

                performCheck($target);
            }
        });
    
        // Scroll
        helper.manageEvent({
            event: 'scroll',
            ev_ns: ev_ns,
            callback: function() {
                performCheck($target);
            }
        });
    }

    // Creates an array of all targets that needs to be visibly toggled
    // --------------------------------------------------
    function updateTargets() {

        // Update targets
        $c.scroll_targets = $(scroll_targets);

        // Empty the array
        visibility_targets_array = [];

        // Loop and add relevant targets 
        $c.scroll_targets.each(function(){

            var $this = $(this),
                $seperate_target = $($this.data('scroll-visibility-target'));

            if ($seperate_target.length) {
                visibility_targets_array.push($seperate_target);

            } else {
                visibility_targets_array.push($this);
            }
        });
    }

    // Main
    // --------------------------------------------------
    function scrollVisibility($target) {

        storeDirection($target);

        calculateOffsets();
        
        // Run check
        performCheck($target);
       
        bindEvents($target);
    }

    // Get the force hide status
    // --------------------------------------------------
    function getForceHiddenStatus() {
        return force_hide;
    }
 
    // Update
    // --------------------------------------------------
    function update() {

        // Update the visibility target array for using with force hiding / showing
        updateTargets();

        // Disable scroll vis on touch devices
        if (!Modernizr.touchevents) {
            // Loop over targets
            $c.scroll_targets.each(function(){
                scrollVisibility($(this));
            });
        }
        
    }

    // Refresh
    // --------------------------------------------------
    function refresh() {

        // Unbind previously bound events (With the namespace)
        metric.$c.window.off('.' + ev_ns);

        update();
    }

    // Init
    // --------------------------------------------------
    function init(){
        update();
    }
    
    init();
    
    // Public
    // --------------------------------------------------
    return {
        init: init,
        hide: forceHide,
        show: forceShow,
        refresh: refresh,
        forceHidden: getForceHiddenStatus
    };
});