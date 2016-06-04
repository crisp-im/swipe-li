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
  .directive('swipeLi', ['$timeout', '$window', '$swipe', function ($timeout, $window, $swipe) {
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

		    var MAX_VERTICAL_DISTANCE = 75;
		    var MIN_HORIZONTAL_DISTANCE = 160;
		    var MAX_VERTICAL_RATIO = 0.3;

        var element = iElement.find('div');
        var container = iElement.find('ul');
        var panes = iElement.find('li');
        var pane_width = 0;
        var pane_count = 3;
        var current_pane = 0;

        var startCoords = {
        	x : 0,
        	y : 0
        }

        var is_moving = false;

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

        scope.init();

        $swipe.bind(angular.element(element[0]), {
          start : function(coords, event) {
          	startCoords = coords;
          	event.preventDefault();
           	is_moving = true;
          },
          cancel : function(event) {
          	//event.preventDefault();
            is_moving = false;
            scope.showPane(current_pane, true);
          },
          end : function(coords, event) {
          	//event.preventDefault();
          	is_moving = false;
            scope.showPane(current_pane, true);
          },
          move : function(coords, event) {

          	event.preventDefault();

          	var deltaY = Math.abs(coords.y - startCoords.y);
          	var deltaX = (coords.x - startCoords.x);

          	console.log(deltaX);

 						if (is_moving && deltaY < MAX_VERTICAL_DISTANCE
 							&& deltaY / deltaX < MAX_VERTICAL_RATIO) {


 							if ((Math.abs(deltaX) > MIN_HORIZONTAL_DISTANCE)) {
 								if (deltaX > 0) {
 									scope.showPane(0, true);
              		scope.onComplete('accept');
 								} else {
 									scope.showPane(2, true);
              		scope.onComplete('reject');
 								}
 							} else {
		          	var pane_offset = -(100 / pane_count) * current_pane;
		          	var drag_offset = ((100 / pane_width) * deltaX) / pane_count;

		          	if (current_pane === 0 && deltaX > 0 ||
		          		(deltaX < 0 && current_pane == pane_count - 1)) {
		              drag_offset *= 0.4;
		            }

		         		scope.setContainerOffset(drag_offset + pane_offset);
	         		}
         		}
         		else {
         			is_moving = false;
         		}

          }
        }, ["touch", "mouse"]);
      }
    }
  }]);
