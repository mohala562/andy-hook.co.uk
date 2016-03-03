// Nav highlight
// Highlights nav elements based on scroll position
// --------------------------------------------------
define(['metrics', 'helpers'], function(metric, helper, scrollWindow) {

    var breakpoint = metric.cache.nav_break_mql,
        $nav_links = $('.js__main-nav__link'),
        ev_ns = 'nav_highlight',

        // States
        s = {
            highlight: 's__nav-highlight'
        },

        // For storing the last clicked link
        clicked_link;


    // Highlighting
    // --------------------------------------------------
    function highlight($target){
        $target.addClass(s.highlight);
    }

    function remove_highlight($target){
        $target.removeClass(s.highlight);
    }

    // Manages highlighting
    // --------------------------------------------------
    function manageHighlight($link, $link_target, $extended_target) {

            // Calculate position and size of elements
        var link_target_scrolltop = $link_target.offset().top,

            // If an extended target is supplied then get its height, otherwise use 0
            section_extend = $extended_target.outerHeight() || 0,

            // Arbitrary value is to negate some browser rounding issues when scrolling
            section_pos_top = link_target_scrolltop - metric.cache.topbar_height - 1,
            target_height = $link_target.outerHeight(),
            section_pos_bottom = section_pos_top + section_extend + target_height;

        // Check scroll position against position of the specified target
        if (metric.cache.scroll_pos > section_pos_top && metric.cache.scroll_pos < section_pos_bottom) {

            // If the document is being scrolled by JS then don't highlight any targets
            // We still want to remove highlights however to avoid "sticking"
            if (metric.cache.doc_scrolling) return;

            // Highlight corresponding nav link
            highlight($link);

        // Otherwise remove the highlight, excluding the last clicked element
        } else {
            remove_highlight($link.not(clicked_link));
        }
    }

    // Bind
    // --------------------------------------------------
    function bindEvents($link, $link_target, $extended_target) {

        // Click
        $link.on('click' + '.' + ev_ns, function() {
            
            var $this = $(this);

            // Clear all highlights except for the element clicked
            remove_highlight($nav_links.not($this));

            // Store the selected link outside the closure for reference in other selections..
            clicked_link = $this;

            // Highlight
            highlight($this);
        });

        // Resize
        helper.manageEvent({
            event: 'resize',
            ev_ns: ev_ns,
            callback: function() {
                manageHighlight($link, $link_target, $extended_target);
            }
        });
    
        // Scroll
        helper.manageEvent({
            event: 'scroll',
            ev_ns: ev_ns,
            callback: function() {
               manageHighlight($link, $link_target, $extended_target);
            }
        });
    }

    // unbind events
    // --------------------------------------------------
    function unbindEvents() {

        // Unbind previously bound events
        $nav_links.off('.' + ev_ns);
        metric.$c.window.off('.' + ev_ns);
    }

    // Run main logic
    // --------------------------------------------------
    function initHighlighting(refresh){

        // Loop through each link
        $nav_links.each(function(){

            // Cache and store the link and its target
            var $this = $(this),
                $target = $($this.attr('href')),
                $extended_target = $($this.data('nav-highlight-extend'));

            // Run primary highlighting function
            manageHighlight($this, $target, $extended_target);

            // If refresh is true then don't bind again
            // TODO: Re-factor how the refresh function and this parameter works, right now it's confusing
            if (refresh) return;

            bindEvents($this, $target, $extended_target);
        });
    }

    // Checks screen size and either initializes highlighting or unbinds and removes residual class names
    // --------------------------------------------------
    function checkBreakpoint(mediaQueryList) {

        if (mediaQueryList.matches) {

            initHighlighting();

        } else {

            // Remove any residual classes
            $nav_links.removeClass(s.highlight);
            unbindEvents();
        }
    }

    // Manually refresh highlighting
    // --------------------------------------------------
    function refresh() {

        // Reset the clicked link
        clicked_link = null;

        // Run init function but pass a boolean to say it's a refresh and don't rebind events
        initHighlighting(true);
    }

    // Init
    // --------------------------------------------------
    function init(){

        // Run check
        checkBreakpoint(breakpoint);

        // Add listener on media list to fire on change
        breakpoint.addListener(function (mediaQueryList) {
            checkBreakpoint(mediaQueryList);
        });
    }

    init();

    // Public
    // --------------------------------------------------
    return {
        refresh: refresh
    };
});