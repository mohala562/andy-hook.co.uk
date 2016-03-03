// URL scrolling
// Scrolls to a specfic part of the page based on browser address
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/scroll-window'], function(helper, metric, scrollWindow) {

    var hash = window.location.hash,
        path = window.location.pathname,
        work_dir = '/work';

    // By default all browsers jump to a matching local anchor, this function simply scrolls the window quickly back to the top
    // so that the regular scroll effect is visible
    // --------------------------------------------------
    function counterDefaultBehaviour() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 1);
    }

    // Scan path for work directory and if present return true as being a project page
    // Not very accurate but works for now right now
    // TODO: Find a more robust solution
    function checkProjectPage() {
        if(window.location.href.indexOf(work_dir) > -1) {
           return true;
        }
    }

    // Scroll to the supplied element
    // --------------------------------------------------
    function performScroll() {

        // Scroll to hash if present and not a project page
        if (hash && !checkProjectPage()) {

            var $target = $(hash);

            if ($target.length) {
               scrollWindow.scrollToElement($target, true); 
            }

        // Otherwise check if its a project page and scroll to the container if so
        } else if (checkProjectPage()) {
            scrollWindow.scrollToElement($(metric.cache.project_container), true);
        }

    }

    // Main init
    // --------------------------------------------------
    function init(){

        // Counter browser behaviour if there's a hash in the url
        if (hash) {
           //counterDefaultBehaviour();
        }
        
        // Check and scroll to the hash in the url (If present)
        performScroll();
  
    }

    // Init when document is ready
    $(function(){
        init();
    });

    return {
        scroll: performScroll
    };
});