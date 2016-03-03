// Google analytics events
// Fires send ga events 
// --------------------------------------------------
define(['helpers', 'metrics'], function(helper, metric) {

    // Cache
    var $c = {
            cv_button: $('.js-footer__cv')
        };

    // Bind events
    // Check for ga at event fire due to race condition when loading the analytics code async
    // This way the worst case scenario is that the event doesn't get logged
    // --------------------------------------------------
    function bind() {

        // On new project load
        metric.$c.document.on('pjax:end', function(){
            if (ga) {
                ga('set', 'location', window.location.href);
                ga('send', {
                  hitType: 'pageview',
                  eventCategory: 'Projects',
                  eventAction: 'Viewed Project'
                });
            }
        });

        // On CV click
        $c.cv_button.on('click', function(){
            if (ga) {
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Downloads',
                  eventAction: 'Downloaded CV'
                });
            }
        });
        
    }

    // Init
    // --------------------------------------------------
    function init(){
        bind();
    }
    
    init();
    
    // Public
    // --------------------------------------------------
    return {};
});