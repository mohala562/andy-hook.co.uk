// Nav toggle
// Manages nav format and has basic api for hiding and showing the topbar

// There is heavy use of cascading / nested transitionend/animationend, it's a little convoluted but nessasary to
// allow timing of each animated element while also keeping them decoupled inside the stylesheets
// --------------------------------------------------
define(['helpers', 'metrics', 'modules/hero-affix', 'modules/scroll-visibility'], function(helper, metric, heroAffix, scrollVisibility) {

		// State classes
	var s = {
			nav_closed: 's__nav-closed',
			nav_open: 's__nav-open',
			overlay_visible: 's__overlay-visible',
			nav_visible: 's__nav-visible',
			nav_complete: 's__nav-complete',
			bar_format: 's__nav-bar',
			hero_format: 's__nav-hero',

            project_open: 's__project-open',
            project_closed: 's__project-closed'
		},

		// Object cache
		$c = {
			topbar: $('.js__topbar'),
			topbar__menu:  $('.js__topbar__menu'),
			topbar__overlay: $('.js__topbar__overlay'),
			main_nav__item: $('.js__main-nav__item'),
			navicon: $('.js__topbar__navicon'),
			close__overlay: $('.js__topbar__close-overlay')
		},

		// The breakpoint at which the nav changes from mobile to the full traditional format
		mobile_nav_breakpoint = metric.cache.nav_break_mql,

		// Event namespace
		ev_ns = '.nav_toggle',

		// Class name given to static navigation
		static_nav_selector = 'js__topbar--static',

		// Status flags
		nav_open,
		project_nav_open,
		static_nav,

		// Delay between hiding fullscreen and showing the topbar
		wait_time = 50,

		// Flag for managing bind actions
		// Limit them to only work when not animating
		animating,

		// Flag for managing when in topbar mode
		in_topbar_mode;

	// Remove wait time if transitions are not supported 
	if(!Modernizr.csstransitions) {
		wait_time = 0;
	}

	// Show / hide bar
	// --------------------------------------------------
	function hideBar() {

		// Slide if topbar, otherwise fade
		if (in_topbar_mode) {
			$c.topbar.css({'transform': 'translate3D(0,-100%,0)'});
		} else {
			$c.topbar.css({'opacity': '0'});
		}
	}

	function showBar() {

		// Slide if topbar, otherwise fade
		if (in_topbar_mode) {
			$c.topbar.css({'transform': 'translate3D(0,0,0)'});
		} else {
			$c.topbar.css({'opacity': '1'});
		}
	}

	// Show / hide navicon
	// --------------------------------------------------
	function hideNavicon() {

		// Force hide the navicon
		// Too awkward to do with CSS given the state setup
		$c.navicon.css({'display' : 'none'});
	}

	function showNavicon() {
		
		// Force show the navicon
		// Too awkward to do with CSS given the state setup
		$c.navicon.css({'display' : 'block'});
	}

	// Open actions
	// --------------------------------------------------
	function openAction() {

		// Don't execute if animation is in progress or the nav is already open
		if(animating || nav_open) return;

		var transition_count = 0; // Incrementing counter for transitions

		animating = true;

		// Run the hide function before binding the transition check
		// Because ie9 fires callback immediately so these actions need to be sequential
		hideBar();

		// Wait for topbar to hide
		helper.transitionCheck($c.topbar, function(){

			// Hide navicon
			hideNavicon();

			// Doesn't show the bar in this context but rather adds the styles necessary
			// To allow the rest of the menu to expand correctly
			showBar();

			// Show mobile menu
			$c.topbar.removeClass(s.nav_closed).addClass(s.nav_open).addClass(s.overlay_visible);

			// Wait for overlay to show
			helper.transitionCheck($c.topbar__overlay, function(){

				// Show navigation
				$c.topbar.addClass(s.nav_visible);

				// Wait for nav to show
				helper.transitionCheck($c.main_nav__item, function(){

					transition_count = transition_count + 1;

                    if(transition_count === $c.main_nav__item.length) {

						// Complete state allows hover and active to work on certain elements
			            // Works around some animation bugs by disabling them after being played etc..
			            $c.topbar.addClass(s.nav_complete);

			            // Hide page content to allow animation on close..
			            scrollVisibility.hide();

			            // Set status
			            nav_open = true;
			            animating = false;

						// Reset counter
			        	transition_count = 0;
					}
				});
			});
		});
		
	}

	// Close action
	// --------------------------------------------------
	function closeAction() {

		// Don't execute if animation is in progress or if nav is already closed
		if(animating || !nav_open) return;

		animating = true;
		
		// Remove complete status and hide the navigaiton
		$c.topbar.removeClass(s.nav_complete).removeClass(s.nav_visible);

		// Wait for nav to hide
		helper.transitionCheck($c.main_nav__item, function(){

			// Hide overlay
			$c.topbar.removeClass(s.overlay_visible);

			// Allow scroll visibility to show content
			scrollVisibility.show();

			// Wait for overlay to hide
			helper.transitionCheck($c.topbar__overlay, function(){

				// Show navicon
				showNavicon();

				// Temporarily disable transitions to instantly hide the top bar and avoid jank
				$c.topbar.css({
					'transition': 'none'
				});

				// Hide topbar
				hideBar();

				// Switch to topbar mode
				$c.topbar.removeClass(s.nav_open).addClass(s.nav_closed);

				// Wrapped in a setTimeout because it fixes a visual display oddity, probably related to execution order or time
				// TODO: Figure out why this works and produce a more robust solution
				setTimeout(function(){
					showBar();

					// Prevent the transition from sticking and affecting other actions
					// Also remove transform so that it doesn't interfere with sliding effect
					$c.topbar.css({'transition': '', 'transform': ''});

					// Set status
					animating = false;
					nav_open = false;

				}, 0);
			});
		});
	}

	// Open or close the menu depending on context
	// --------------------------------------------------
	function manageMenuState() {

		if (nav_open) {
			closeAction();
		} else {
			openAction();
		}
	}

	// Switch between top bar styles
	// --------------------------------------------------
	function switchToBarStyle() {
		$c.topbar.addClass(s.bar_format).removeClass(s.hero_format);

		in_topbar_mode = true;
	}

	function switchToHeroStyle() {
		$c.topbar.addClass(s.hero_format).removeClass(s.bar_format);

		in_topbar_mode = false;
	}

	// Check scroll position and apply or remove bar style
	// --------------------------------------------------
	function checkNavFormat() {

		var scroll_pos = metric.cache.scroll_pos,
			hero_is_fixed = heroAffix.status().is_fixed;

		// Switch bar mode differently depending on whether the hero is fixed or not
		if (hero_is_fixed) {

			var offset = metric.cache.hero_height - metric.cache.topbar_outer_height - metric.cache.topbar_clearance;

			// Check bar style
			if (scroll_pos > offset && !in_topbar_mode) {
				switchToBarStyle();

			} else if (scroll_pos <= offset && in_topbar_mode) {
				switchToHeroStyle();
			}
			
		} else {

			// Check bar style
			if (scroll_pos > metric.cache.topbar_clearance && !in_topbar_mode) {
				switchToBarStyle();

			} else if (scroll_pos <= metric.cache.topbar_clearance && in_topbar_mode) {
				switchToHeroStyle();
			}
		}
	}

    // Show project nav
    // --------------------------------------------------
    function showProjectNav() {
        $c.topbar.addClass(s.project_open).removeClass(s.project_closed);

        // Set flag
        project_nav_open = true;
    }

    // Hide project nav
    // --------------------------------------------------
    function hideProjectNav() {
        $c.topbar.addClass(s.project_closed).removeClass(s.project_open);

        // Set flag
        project_nav_open = false;
    }

	// Check whether to hide or show the project nav
	// --------------------------------------------------
	function checkProjectNav() {

		var scroll_pos = metric.cache.scroll_pos,

			// Start position with some arbitrary buffer for browser rounding
            display_start = metric.cache.project_offset_top - metric.cache.topbar_height - 10,

            // End position
            display_end = display_start + metric.cache.project_height;
		
        // Show project nav if the scroll position is between the two points
		if (in_topbar_mode && !metric.cache.doc_scrolling && scroll_pos > display_start && scroll_pos < display_end) {
			showProjectNav();
		} else {
            hideProjectNav();
        }        
	}

	// Ensure 'forced hidden' content is always shown on larger screens
    // --------------------------------------------------
    function forceUnhideOnLarge(mediaQueryList) {

        if (mediaQueryList.matches && scrollVisibility.forceHidden && nav_open) {
            scrollVisibility.show();
        } else if (!mediaQueryList.matches && nav_open) {
            scrollVisibility.hide();
        }
    }

	// Return the current animation status
	// --------------------------------------------------
	function getAnimationStatus() {
		return animating;
	}

	// Return the project nav status
	// --------------------------------------------------
	function getProjectNavStatus() {
		return project_nav_open;
	}

	// Event bindings
	// --------------------------------------------------
	function bindEvents() {

		// Close and open buttons
		$c.topbar__menu.on('click' + ev_ns, function() {
			manageMenuState();
		});

		$c.close__overlay.on('click' + ev_ns, function() {
			manageMenuState();
		});

		// Bind scroll handlers if NOT a static bar
		if (!static_nav) {

			// Scrolling
			helper.manageEvent({
				event: 'scroll',
				callback: function() {
					checkNavFormat();
					checkProjectNav();
				}
			});

			// Resize
			helper.manageEvent({
				callback: function() {
					checkNavFormat();
					checkProjectNav();
				}
			});
		}
		
	}

	// Manual refresh
	// --------------------------------------------------
	function refresh(){
		checkProjectNav();
		checkNavFormat();
	}

	// Init
	// --------------------------------------------------
	function init() {

		// Set flag if the nav is static
		if ($c.topbar.hasClass(static_nav_selector)) {
			static_nav = true;
		}

		// Bind
		bindEvents();

		// Check nav format and project nav if NOT a static bar
		if (!static_nav) {
			checkNavFormat();
			checkProjectNav();
		}

		// Run check against screen size to force an un hide if necessary
	    forceUnhideOnLarge(mobile_nav_breakpoint);

		// Add listener to media list to fire on change
	    mobile_nav_breakpoint.addListener(function (mediaQueryList) {
	        forceUnhideOnLarge(mediaQueryList);
	    });
	}

	init();

	// Public
	// --------------------------------------------------
	return {
		showBar: showBar,
		hideBar: hideBar,
		closeMenu: closeAction,
		openMenu: openAction,
		isAnimating: getAnimationStatus,
		projectNavOpen: getProjectNavStatus,

		refresh: refresh
	};

});