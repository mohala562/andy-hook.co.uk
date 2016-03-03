// Document loading
// Manage document loading effects
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/scroll-visibility'], function(helper, metric, scrollVisibility) {

        // States
    var s = {
            doc_initialized: 's__doc-initialized',
            doc_loaded: 's__doc-loaded',
            doc_static: 's__doc-static',
            doc_show_loading: 's__doc-show-loading',

            doc_slide_next: 's__doc-slide-next',
            doc_slide_prev: 's__doc-slide-prev',

            doc_wait_right: 's__doc-wait-right',
            doc_wait_left: 's__doc-wait-left'
        },

        // Object cache
        $c = {
            loading_spinner: $('.js__loading__spinner'),

            // Get all top level page modules
            doc_modules: $('.js__hero, .js__work, .js__project, .js__about, .js__skills, .js__footer')
        },

        in_progress,
        slide_dir,

        // Loading grace in milliseconds
        // This is used mainly for testing effects
        loading_grace = 1000;

    // Manage in progress flag
    // --------------------------------------------------
    function inProgress(){
        return in_progress;
    }

    // show loader
    // --------------------------------------------------
    function showLoader(cb){

        // If a callback is supplied then wait for the loader to finish the transition and fire
        helper.transitionCheck($c.loading_spinner, function(){
            if(cb) {
                cb();
            }

            metric.$c.body.removeClass(s.doc_loaded);
        });

        // Show loading screen
        metric.$c.body.addClass(s.doc_show_loading);
    }

    // Hide loader
    // --------------------------------------------------
    function hideLoader(cb){
        
        // If a callback is supplied then wait for the loader to finish the transition and fire
        helper.transitionCheck($c.loading_spinner, function(){

            if(cb) {
                cb();
            }

            metric.$c.body.addClass(s.doc_loaded);
        });
        

        // Hide loading screen
        metric.$c.body.removeClass(s.doc_show_loading);
    }

    // Slide in
    // --------------------------------------------------
    function slideIn(dir, cb) {

        // Don't execute if the previous request / load is still in progress
        if (in_progress) return;

        var transition_count = 0; // Incrementing counter for transitions

        slide_dir = dir;

        // Set "in progress" flag
        in_progress = true;

        // Check direction of slide and add corresponding states
        if (dir === 'next') {
            metric.$c.body.addClass(s.doc_slide_next);
        } else if (dir === 'prev') {
            metric.$c.body.addClass(s.doc_slide_prev);
        }

        // Remove static state from document (As we are now in a loading animation state)
        metric.$c.body.removeClass(s.doc_static);

        // Watch modules for transition end events
        helper.transitionCheck($c.doc_modules, function(){

            // Increment the count
            transition_count = transition_count + 1;

            // Run after all elements in the set have completed their transitions
            if (transition_count === $c.doc_modules.length) {

                // Check direction, toggle more states
                if (dir === 'next') {
                    metric.$c.body.addClass(s.doc_wait_right).removeClass(s.doc_slide_next);
                } else if (dir === 'prev') {
                    metric.$c.body.addClass(s.doc_wait_left).removeClass(s.doc_slide_prev);
                }

                // Show loader and fire callback on transition completion
                showLoader(function(){

                    // Fire callback
                    cb();

                    // Reset counter
                    transition_count = 0;
                });
            }
        });
    }

    // Slide out
    // --------------------------------------------------
    function slideOut(cb){

        // Add an artificial delay for instances where content loads so fast is misfires transitionEnd events
        // This is mostly used for testing locally, though can serve for better visual feedback
        setTimeout(function(){

            // Hide loader
            hideLoader(function(){

                // Fire callback
                cb();

                // Incrementing counter for transitions
                var transition_count = 0;

                // Watch modules for transition end events
                helper.transitionCheck($c.doc_modules, function(){

                    // Increment counter
                    transition_count = transition_count + 1;

                    // Set flag only after all sections have finished animating
                    if (transition_count === $c.doc_modules.length) {

                        metric.$c.body.addClass(s.doc_static);

                        // Set "in progress" flag
                        in_progress = false;
                    }
                });

                // Remove wait classes to make the document slide back in to view, also add a "loaded" state
                metric.$c.body.removeClass(s.doc_wait_right).removeClass(s.doc_wait_left);

            });

        }, loading_grace);
    }

    // Initial load screen
    // --------------------------------------------------

    // Hide initial loading screen once the is DOM ready
    $(function(){

        scrollVisibility.hide();

        // setTimeout uses the loading grace value to delay the hiding of the loading screen
        setTimeout(function(){

            scrollVisibility.show();

            // Add loaded and init status classes after loader has been hidden
            hideLoader(function(){

                // Set init status
                metric.$c.body.addClass(s.doc_initialized);
            });
           
        }, loading_grace);

        // Set static
        metric.$c.body.addClass(s.doc_static);
    });

    // Public
    // --------------------------------------------------
    return  {
        state: s,
        cache: $c,
        showLoader: showLoader,
        hideLoader: hideLoader,
        slideIn: slideIn,
        slideOut: slideOut,
        inProgress: inProgress
    };

});