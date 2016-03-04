// Helpers
// Helper functions and useful variables
// --------------------------------------------------
define(['plugins/throttle-debounce'], function(throttle_debounce) {

    var poll_freq = 50, // Default frequency for event throttling

        // Prevent event firing twice by checking the type of prefix needed for the browser
        // Uses modernizr to check the prefix
        // See http://www.iambacon.co.uk/blog/prevent-transitionend-event-firing-twice
        transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
            'MozTransition'    : 'transitionend',      // only for FF < 15
            'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
        },

        transition_props = transEndEventNames[ Modernizr.prefixed('transition') ],

        // Prevent event firing twice by checking the type of prefix needed for the browser
        // Uses modernizr to check the prefix
        // See http://www.iambacon.co.uk/blog/prevent-transitionend-event-firing-twice
        // And https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/
        animations = {
            "animation"      : "animationend",
            "OAnimation"     : "oAnimationEnd",
            "MozAnimation"   : "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        },

        // Return a supported property based on the browser
        animation_props = animations[ Modernizr.prefixed('animation') ],

        helpers = {

            // Utility functions
            // --------------------------------------------------

            // Strip hash from a string
            stripHash: function(str) {
                return str.split('#')[0];
            },

            // Get the last directory of a url
            getLastDir: function(url) {
                return url.match(/([^\/]*)\/*$/)[1];
            },

            // Remove trailing slash from a string
            stripTrailingSlash: function(str) {
                if(str.substr(-1) === '/') {
                    return str.substr(0, str.length - 1);
                }
                return str;
            },

            // Scroll event throttle
            throttleEvent: function ($el, event, callback, frequency) {

                // Assign default frequency
                frequency = frequency || polling_frequency;

                // Bind to resize
                $el.on(event, throttle_debounce.throttle(frequency, callback));
            },

            // Scroll event throttle
            debounceEvent: function ($el, event, callback, frequency) {

                // Assign default frequency
                frequency = frequency || polling_frequency;

                // Bind to resize
                $el.on(event, throttle_debounce.debounce(frequency, callback));
            },

            // Manages resize or scroll events, takes options to control axis to fire.
            // Also checks against the window dimension to ensure an actual resize has occurred (Prevents a bug in ie9 where the handler is fired on page load)
            manageEvent: function (user_opts) {

                // Defaults
                var opts = {
                    $window: $(window),
                    event: 'resize',
                    callback: null,
                    freq: poll_freq,
                    type: 'throttle',
                    ev_ns: null
                };

                // Extend with custom options if supplied
                if (user_opts) {
                    $.extend(opts, user_opts);

                }

                // Get current dimensions
                var height = opts.$window.outerHeight(),
                    width = opts.$window.outerWidth();

                // Checks for and adds a namespace to the event binding
                function createEvent() {

                    // Check if a namespace was supplied
                    if (opts.ev_ns) {

                        return opts.event + '.' + opts.ev_ns;
                    }

                    // Otherwise just return the event name
                    return opts.event;
                }

                // Look at supplied axis and check against relevant dimensions
                function manageCallback() {

                    // Limit to an axis on resize  if needed
                    if (opts.event === 'resize' && opts.axis) {

                        // Latest height and width
                        var new_height = opts.$window.outerHeight(),
                            new_width = opts.$window.outerWidth();


                        switch (opts.axis) {

                            // Fire on x
                            case 'x':
                                if (width !== new_width) {
                                    opts.callback();

                                    // Update previous value
                                    width = new_width;
                                }

                            break;

                            // Fire on y
                            case 'y':
                                if (height !== new_height) {
                                    opts.callback();

                                    // Update previous value
                                    height = new_height;
                                }

                            break;

                            // Fire on both
                            default:
                                if (width !== new_width || height !== new_height) {
                                    opts.callback();

                                    // Update previous values
                                    width = new_width;
                                    height = new_height;
                                }
                        }


                    // If not a resize then just fire the callback
                    } else {
                       opts.callback(); 
                    }
                }

                // Check type of control and bind
                switch (opts.type) {

                    case 'throttle':
                        opts.$window.on(createEvent(), throttle_debounce.throttle(opts.freq, manageCallback));

                    break;

                    case 'debounce':
                        opts.$window.on(createEvent(), throttle_debounce.debounce(opts.freq, manageCallback));
                }
            },

            // Check for transition end event
            transitionCheck: function ($el, callback) {

                // Only in browsers with transition support..
                if (Modernizr.csstransitions) {

                    // Bind
                    $el.on(transition_props, function(e){

                        // Analyse event object and ensure the target matches the bound object
                        // This prevents the callback from being fired by children (event bubbling)
                        if($el.is(e.target)) {

                            // Fire callback
                            callback();
                        
                            // Unbind now that the callback has been fired
                            $(this).off(transition_props);
                        }

                        // Don't let the event bubble up to a parent
                        // This is probably not needed given that the helper is always used for checking transitions and I already examine and compare the event
                        e.stopPropagation();
                    }); 

                } else {

                    // If no transition support then run the callback immediately (No visible effects to wait for)
                    callback();
                }
                
            },

            // Check for animation end event
            animationCheck: function ($el, callback) {

                // Only in browsers with animation support..
                if (Modernizr.cssanimations) {

                    // Bind
                    $el.on(animation_props, function(e){

                        // Analyse event object and ensure the target matches the bound object
                        // This prevents the callback from being fired by children (event bubbling)
                        if($el.is(e.target)) {
 
                            // Fire callback
                            callback();

                            // Unbind now that the callback has been fired
                            $(this).off(animation_props);
                        }

                        // Don't let the event bubble!
                        e.stopPropagation();
                    }); 

                } else {

                    // Don't let the event bubble up to a parent
                    // This is probably not needed given that the helper is always used for checking transitions and I already examine and compare the event
                    callback();
                }
            }
	   };

    // Public
    // --------------------------------------------------
	return helpers;
});