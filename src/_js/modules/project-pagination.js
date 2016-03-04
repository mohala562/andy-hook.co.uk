// Project pagination
// Manages the project pagination
// --------------------------------------------------
define(['helpers'], function(helper) {

    // Cache objects
    var $c = {
            thumbnails: $('.js__gallery__thumbnail'),

            next_button: $('.js__project-nav__link--right'),
            prev_button: $('.js__project-nav__link--left')
        },

        // Define arrays
        project_name_array = [],
        project_href_array = [],

        // Define position vars
        current_pos,
        next_pos,
        prev_pos,

        // For adding and exposing methods
        module = {};

    // Build out initial link array
    // Scoops up all of the hrefs from the thumbnail anchors and pushes them onto the array
    // --------------------------------------------------
    function buildArray() {
        $c.thumbnails.each(function(){

            var href = $(this).find('a').attr('href'),
                href_clean = helper.stripHash(href),
                last_dir = helper.getLastDir(href_clean);

            // Push to arrays
            project_name_array.push(last_dir);
            project_href_array.push(href);
        });
    }

    // Get current project name from url
    // --------------------------------------------------
    function getCurrentProjectName() {
        var current_url = window.location.pathname; // Current url path

        // Strip trailing slash, hashes and return just the current directory
        return helper.getLastDir(helper.stripTrailingSlash(helper.stripHash(current_url)));
    }

    // Get index positions in array based on current position
    // --------------------------------------------------
    function getPositions() {

        var current_project = getCurrentProjectName();

        // Update position vars based on current url
        current_pos =  $.inArray(current_project, project_name_array);
        next_pos = (current_pos + 1) % (project_name_array.length);
        prev_pos = (current_pos + project_name_array.length - 1) % (project_name_array.length);
    }

    // Update pagination links
    // --------------------------------------------------
    function updatePagination() {
        getPositions();

        $c.next_button.attr('href', project_href_array[next_pos]);
        $c.prev_button.attr('href', project_href_array[prev_pos]);
    }

    // Init
    // --------------------------------------------------
    function init(){
        buildArray();
        getPositions();
    }

    init();
   
    // Public
    // --------------------------------------------------
    return {
        update: updatePagination
    };
});