// Main - Kickoff the site
// --------------------------------------------------

// Use common config file first
requirejs(['config'], function () {

    // Wrap modules in in a require call to make common libs global dependencies
    requirejs(['modernizr', 'jquery', 'polyfill/polyfill', 'modules/ga-events', 'lib/fixActiveState', 'plugins/easing'], function () {
    
    // Load site modules
    requirejs([
      'modules/nav-toggle',
      'modules/manage-parallax',
      'modules/hero-affix',
      'modules/scroll-window',
      'modules/responsive-images',
      'modules/manage-pjax',
      'modules/project-pagination',
      'modules/scroll-visibility',
      'modules/manage-effects',
      'modules/nav-highlight'
    ]);
  });
});