// Error - Specific page scripts
// --------------------------------------------------

// Use common config file first
requirejs(['config'], function () {

    // Wrap modules in in a require call to make common libs global dependencies
    requirejs(['polyfill/polyfill', 'lib/fixActiveState', 'modernizr', 'jquery', 'lib/fastclick'], function () {
    
    // Load site modules
    requirejs([
    	'modules/nav-toggle',
    	'modules/doc-loading',
    	'modules/manage-parallax',
    	'modules/manage-effects'
    ]);
  });
});