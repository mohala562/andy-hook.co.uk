// URL scrolling
// Scrolls to a specfic part of the page based on browser address
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/scroll-window'], function(helper, metric, scrollWindow) {

    var hash = window.location.hash,
        path = window.location.pathname,
        work_dir = '/work',
        fragment_identifier = '.js__project-fragment';

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
    function checkForWorkURL() {
        if(window.location.href.indexOf(work_dir) > -1) {
           return true;
        }
    }

    // Scroll to the supplied element
    // --------------------------------------------------
    function performScroll() {

        var $project_container = $(metric.cache.project_container),
            $project_fragment = $(fragment_identifier);

        // Scroll to hash if present and not a project page
        if (hash && !checkForWorkURL()) {

            var $target = $(hash);

            if ($target.length) {
               scrollWindow.scrollToElement($target, true); 
            }

        // Check if its a project page and scroll to the container
        // Checks for existence of project content to determine if it's a project page
        // TODO: This is hacky, need to produce a better solution
        } else if (checkForWorkURL() && $project_fragment.length) {
            scrollWindow.scrollToElement($(metric.cache.project_container), true);

        // Check if it's still a work url and scroll to the work container
        } else if (checkForWorkURL()) {
            scrollWindow.scrollToElement(metric.$c.work, true);
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