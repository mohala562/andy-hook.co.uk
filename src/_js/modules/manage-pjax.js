// Manage pjax
// Manages project loading via pjax as well as the sliding load effect
// TODO: Seperate the slide loading effects into a seperate module
// --------------------------------------------------
define(['modules/pjax',
        'modules/responsive-images',
        'helpers', 'modules/project-pagination',
        'plugins/skrollr', 'modules/nav-toggle',
        'modules/scroll-window',
        'modules/scroll-visibility',
        'modules/url-scroll',
        'metrics',
        'modules/doc-loading'], function(pjax, responsiveImages, helper, projectPagination, skrollr, navToggle, scrollWindow, scrollVisibility, urlScroll, metric, docLoading) {

    var $pjax_targets = $('.js__pjax'),

        // IE11 has an issue with using a class name for the container
        // Used an ID to work around it
        // TODO: Submit issue and investigate this problem
        project_container = metric.cache.project_container,

        // Object cache
        $c = {
            project: $(project_container),
            next: $('.js__project-nav__link--right'),
            prev: $('.js__project-nav__link--left')
        },

        // Keyboard event namespace
        keyboard_ns = '.pjax_keyboard_control',

        // Flag for logging if the loading animations are in progress
        in_progress;

    // Get project via pjax request
    // --------------------------------------------------
    function getProject(request_url) {

        var pjax_settings = {
            fragment: project_container, // Where to get contents
            container: project_container, // Where to put contents
            timeout: 5000, // Time before browser performs a hard refresh
            scrollTo: false, // pjax scrolls to the top of the document by default, setting this to false disables that action
            url: request_url, // The project url
            replace: true
        };

        // Perform pjax
        $.pjax(pjax_settings);
    }


    // Pjax start actions
    // --------------------------------------------------
    function startActions($pjax_target) {

        // Store href of target
        var target_href = $pjax_target.attr('href'),
            request_url = helper.stripHash(target_href);

        // Skip animation and navigate to the url if the history api is not supported
        if(!Modernizr.history) {
            window.location.href = target_href;
        }

        // If the previous button is used then slide in reverse, otherwise slide to next
        if ($pjax_target.is($c.prev)) {
            docLoading.slideIn('prev', function(){
                scrollVisibility.hide();
                getProject(request_url);
            });
        } else {
            docLoading.slideIn('next', function(){
                scrollVisibility.hide();
                getProject(request_url);
            });
        }
    }

    // Pjax complete actions
    // --------------------------------------------------
    function completeActions() {
        
        // Update the project pagination with the latest set of urls
        projectPagination.update();

        // Refresh picturefill
        responsiveImages.refresh();

        docLoading.slideOut(function(){

            // Recheck which sections should be visible and show
            scrollVisibility.show();

            // Jump window to project container WITHOUT animation
            scrollWindow.scrollToElement($c.project, true);
        });
    }

    // Bind
    // --------------------------------------------------
    function bindEvents() {

        // Pjax links to click
        $pjax_targets.on('click', function (e) {

            // Attempt pjax if ctrl or middle mouse button is NOT used
            // Otherwise default action opens in same or new tab
            if (!e.ctrlKey && e.which !== 2) {

                // Prevent default behavior
                e.preventDefault();

                // Fire start actions
                startActions($(this));
            }
        });

        // Keyboard controls
        metric.$c.document.on('keydown' + keyboard_ns, function (e) {

            // Only allow pagination to fire when visible
            if (!navToggle.projectNavOpen()) return;

            switch(e.which) {

                // Left arrow
                case 37:

                    // Fire start action with prev button
                    startActions($c.prev);
                break;

                // Right arrow
                case 39:

                    // Fire start action with next button
                    startActions($c.next);
                break;
            }    
        });

        // Listen for the pjax complete event and fire actions
        metric.$c.document.on('pjax:complete', function(){
            completeActions();
        });
    }

    // First run
    // --------------------------------------------------
    function init() {

        // Bind
        bindEvents();
    }

    // Kickoff
    init();
});