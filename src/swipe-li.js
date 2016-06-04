/*
  ------------------------
   	SWIPE LI DIRECTIVE
  ------------------------
	Creates a 3 pane swipeable element.
	Swipe right for accept. Swipe left for reject.

	Be sure to include optimize-animation.js to handle
	requestAnimationFrame and cancel polyfill
*/

angular.module('swipeLi')
  .directive('swipeLi', ['hammerRemote', '$timeout', '$window', function (hammerRemote, $timeout, $window) {
  	'use strict';
    return {
      restrict: 'A',

      link: function (scope, iElement, iAttrs) {

				// On swipe complete
				scope.onComplete = function (type) {
					$timeout(function () {
						scope.showPane(1, true);
						scope.$apply(iAttrs[type]);
					}, 300);
				};

      	// Basic 3 Pane Carousel
				// animation between panes happens with css transitions
			  var element = iElement.find('div');
			  var container = iElement.find('ul');
			  var panes = iElement.find('li');
			  var pane_width = 0;
			  var pane_count = 3;
			  var current_pane = 0;

			  scope.init = function () {
			    setPaneDimensions();
			    // Display the content pane by default
			    scope.showPane(1, false);
			    // Handle resize and orientation change
			    angular.element($window).on('load resize orientationchange', function () {
			      setPaneDimensions();
			    });
			  };

			  // Set the pane dimensions and scale the container
			  function setPaneDimensions() {
			    pane_width = element[0].offsetWidth;
			    angular.forEach(panes, function (pane) {
			      angular.element(pane).css({width : pane_width + 'px'});
			    });
			    angular.element(container).css({width : pane_width * pane_count + 'px'});
			  }

			  // Show pane by index
			  scope.showPane = function (index, animate) {
			    // between the bounds
			    index = Math.max(0, Math.min(index, pane_count - 1));
			    current_pane = index;

			    var offset = -((100 / pane_count) * current_pane);
			    scope.setContainerOffset(offset, animate);
			  };

			  scope.setContainerOffset = function (percent, animate) {
			    container.removeClass('animate');
			    if (animate) {
			      container.addClass('animate');
			    }

			    container.css('transform', 'translate3d(' + percent + '%,0,0) scale3d(1,1,1)');
			  };

			  // Handle hammertime touch events
			  scope.handleHammer = function (ev) {
			    // Disable browser scrolling
			    ev.gesture.preventDefault();
			    // Check to see if disabled or not

			    switch (ev.type) {
				    case 'dragright':
				    case 'dragleft':
				      // stick to the finger
				      var pane_offset = -(100 / pane_count) * current_pane;
				      var drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count;

				      // slow down at the first and last pane
				      if ((current_pane === 0 && ev.gesture.direction === 'right') ||
				        (current_pane == pane_count - 1 && ev.gesture.direction == 'left')) {
				        drag_offset *= 0.4;
				      }

				      scope.setContainerOffset(drag_offset + pane_offset);
				      break;

				    case 'swipeleft':
				      scope.showPane(2, true);
				      scope.onComplete('reject');
				      ev.gesture.stopDetect();
				      break;

				    case 'swiperight':
				      scope.showPane(0, true);
				      scope.onComplete('accept');
				      ev.gesture.stopDetect();
				      break;

				    // More then 50% moved, navigate
				    case 'release':
				    	if (Math.abs(ev.gesture.deltaX) > pane_width / 2) {
				        if (ev.gesture.direction == 'right') {
				        	scope.showPane(0, true);
				          scope.onComplete('accept');
				        } else {
				        	scope.showPane(2, true);
				          scope.onComplete('reject');
				        }
				      } else {
				        scope.showPane(current_pane, true);
				      }
				      break;
			    }
			  };

				// Register a new hammer instance
				scope.id = hammerRemote.register(
					element[0],
					{ drag_lock_to_axis: true });

				// Init the carousel
				hammerRemote.getHammer(scope.id)
					.then(function (hammertime) {
						hammertime.on('release dragleft dragright swipeleft swiperight', scope.handleHammer);
						scope.init();
					});

				// Handle destroy for hammer
        scope.$on('$destroy', function () {
          hammerRemote.unregister(scope.id);
        });
      }
    };
  }]);
