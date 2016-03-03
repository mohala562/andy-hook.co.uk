// Responsive images
// Loads adequately sized images based on screen size
// --------------------------------------------------
define(['helpers', 'metrics', 'plugins/skrollr', 'modules/scroll-visibility'], function(helper, metric, skrollr, scrollVisibility) {

    // Defaults
    var pf_target = '.js__pf-image',
        pf_controller = '.js__pf-image-controller',
        lazyload = 'js__pf-image-controller--lazyload',

        base_ns = 'picturefill',

        // States
        s = {
            loading: 's__pf-loading',
            loaded: 's__pf-loaded'
        };

    function refreshFunctions(){
        // Update metrics after each complete
        metric.forceUpdate();

        // Refresh skrollr after picturefill has completed
        if (skrollr.get()) {
            skrollr.get().refresh();
        }

        // Refresh visibility of sections
        scrollVisibility.refresh();
    }

    function showLoading($el) {
        $el.addClass(s.loading).removeClass(s.loaded);
    }

    function hideLoading($el) {
        $el.removeClass(s.loading).addClass(s.loaded);
    }

    // Loads correct image based on matching MQ
    // Adapted script based on Scott Jehls 'picturefull' 1.2.1
    // https://github.com/scottjehl/picturefill/blob/1.2.1/picturefill.js
    function picturefill($controller) {

        var $pf_target = $controller.find(pf_target),
            sources = $pf_target.find('span'),
            matches = [],
            media,
            $img = $pf_target.find('img');

        for (var i = 0, len = sources.length; i < len; i++) {
            media = sources[i].getAttribute('data-media');

            if(!media || (Modernizr.mq(media))) {
                matches.push(sources[i]);
            }
        }

        if (matches.length) {

            var img_url = matches[matches.length - 1].getAttribute('data-src'); // Get image img_url

            // Build an image if one doesn't exist yet
            if (!$img.length) {
                var $new_img = $('<img>');
                $new_img.attr('alt', $pf_target.data('alt'));
            
                $pf_target.append($new_img);

                $img = $new_img;
            }

            // Assign img src only when needed
            if ($img.attr('src') !== img_url) {
            
                // Set loading state
                showLoading($controller);

                // Bind to loaded event
                $img.one('load', function(){

                    hideLoading($controller);
                    
                    // Toggle classes
                    $controller.data('pf_init', true);

                    // Refresh other modules
                    refreshFunctions();

                // Change src
                }).attr('src', img_url);
            }

        } else if ($img) {
            $(this).remove($img);
        }
    }

    // Lazy load checking conditions
    // --------------------------------------------------
    function lazyCheck($el, cb) {

        var target_scrolltop = $el.offset().top,
            window_height = metric.cache.window_height,
            scroll_pos = metric.cache.scroll_pos + window_height;

        // Always run on initialized images
        if($el.data('pf_init') || !$el.hasClass(lazyload)) {
            picturefill($el);
        }

        // Otherwise check position and fire a callback if supplied
        if (scroll_pos > target_scrolltop) {
            picturefill($el);

            if(cb) {
                cb();
            }
        }
    }

    // Bind events
    // --------------------------------------------------
    function bind(i, $el) {

        var namespace = base_ns + '.' + i;
        
        // Bind to scroll for lazy loading
        if ($el.hasClass(lazyload)) {

            // Keep a very low frequency to avoid visual "jank" when switching between images
            helper.manageEvent({
                type: 'throttle',
                event: 'scroll',
                ev_ns: namespace,

                // This callback is the problem
                callback: function(){
                    lazyCheck($el, function(){
                       metric.$c.window.off('scroll.' + namespace);
                    });
                },
            });
        }

        // Keep a very low frequency to avoid visual "jank" when switching between images
        helper.manageEvent({
            freq: 10,
            type: 'throttle',
            ev_ns: namespace,

            callback: function(){
                lazyCheck($el);
            },
        });
    }

    // Loop over targets and run
    // --------------------------------------------------
    function apply($target) {
        $target.each(function(i) {
            var $this = $(this);
            
            lazyCheck($this);
            bind(i, $this);
        });
    }

    // Init
    // --------------------------------------------------
    function init() {

        var $target = $(pf_controller);

        if ($target.length) {
            apply($target);
        }

        $('.js__project').on('click', function(){
            apply($target);
        });
    }

    // Refresh picturefill
    // --------------------------------------------------
    function refresh() {

        // Unbind previously bound events
        metric.$c.window.off('scroll.' + base_ns).off('resize.' + base_ns);

        var $target = $(pf_controller);

        // Check existence then run
        if ($target.length) {
            apply($target);

            // Refresh other modules
            refreshFunctions();
        }
    }

    init();
    
    // Public
    // --------------------------------------------------
    return {
        refresh: refresh
    };
});