// Scroll Window
// Scrolls window to a target or scroll position
// --------------------------------------------------
define(['metrics', 'modules/nav-toggle','modules/nav-highlight' ], function(metric, navToggle, navHighlight) {

    var $elements = $('[data-scroll]'),

        // The media query of the nav format change
        full_nav_breakpoint = window.matchMedia(metric.cache.screen_width.min_md);

    // Core function for scrolling the window
    // --------------------------------------------------
    function scrollWindow(user_opts, callback) {

        'use strict';

        // Defaults
        var opts = {
            noAnimation: false,
            target: null,
            offset: 0,
            speed: 1250,
            easing: 'easeOutQuint'
        };

        var $scrolling_el = $('body, html'),
            callback_ran = false; // Flag to work around the double callback firing

        // Extend with custom options if supplied
        if (user_opts) {
            $.extend(opts, user_opts);
        }

        // Ensure callback only fires once
        // Would normally fire twice because we need to animate both the body and html elements
        function fireCallback() {
            
            if(callback && !callback_ran) {

                callback();

                callback_ran = true;
            }
        }

        // Get target position
        function targetPosition(target_pos, offset) {

            var calc_position,
                viewport_center;

            // If a number is supplied then simply return that value
            if ($.isNumeric(target_pos)) {
                return target_pos;
            }

            // Otherwise get the object position minus the offset if necessary
            return Math.round(target_pos.offset().top - offset);
        }

        // Allow an interruption of scroll via user input
        function bindScrollInterrupt() {

            // Check for a scroll/key/touch event and stop the animation
            // Lets the user interrupt the animation with manual action
            $scrolling_el.bind('mousedown wheel DOMMouseScroll mousewheel keyup touchstart', function () {

                // Halt scroll on user action
                $scrolling_el.stop();

                // Set flag inside metric cache
                metric.addMetric('doc_scrolling', false);

                // Unbind this event straight after
                $scrolling_el.unbind('wheel mousedown DOMMouseScroll mousewheel keyup touchstart');

                // Prematurely fire the callback if the user halts the scroll
                fireCallback();
            });
        }

        // Animate the scroll
        function performScroll() {

            var calculated_pos = targetPosition(opts.target, opts.offset);

            // Jump the window without animation if opt supplied
            if(opts.noAnimation) {
                $scrolling_el.scrollTop(calculated_pos);

                // End execution because we are not animating and don't need to worry about anything else
                return;
            }

            // Set flag inside metric cache
            metric.addMetric('doc_scrolling', true);

            // Perform animation and fire callback on completion
            $scrolling_el.stop().animate({
                scrollTop: calculated_pos
            }, opts.speed, opts.easing, function(){

                // Set scrolling flag to false as the animation has complete
                metric.addMetric('doc_scrolling', false);

                // Fire off the callback
                fireCallback();
            });

            // Bind interrupt
            bindScrollInterrupt();
        }

        // Perform the scroll
        performScroll();
    }

    // Scroll the window with an offset equal to the top bar height
    // --------------------------------------------------
    function scrollToElement($target, animate){

        // Calculate offset
        var topbar_offset = metric.cache.topbar_height;

        // Scroll the window
        scrollWindow({
            target: $target,
            offset: topbar_offset,
            noAnimation: animate
        }, function(){

            // Always refresh the highlight position and project navigation
            navHighlight.refresh();
            navToggle.refresh();
        });
    }

    // Init
    // --------------------------------------------------
    function init(){

        // Loop over elements
        $elements.each(function(){

            var $el = $(this),
                target = $el.attr('data-scroll');

            // Grab and use href if given
            if (target === 'href') {
                target = $($el.attr('href'));
            }

            // Bind click handler
            $el.on('click', function(e){

                e.preventDefault();

                // Don't execute if the nav is animating between states
                if(navToggle.isAnimating()) return;

                // Attempt to close the menu if it's in full mode and visible
                if(!metric.cache.nav_break_mql.matches) {
                    navToggle.closeMenu();
                }
                
                // Scroll to element
                scrollToElement(target);
            });
        });
    }

    init();

    // Public
    // --------------------------------------------------
    return {
        useCore: scrollWindow,
        scrollToElement: scrollToElement
    };
});