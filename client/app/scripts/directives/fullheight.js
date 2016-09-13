'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:fullHeight
 * @description
 * # fullHeight
 */
angular.module('clientApp')
    .directive('fullHeight', [ '$window', '$document',function ($window, $document) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {

                angular.element($window).on('resize', onWindowResize);
                onWindowResize();

                function onWindowResize() {
                    var totalHeight = $window.innerHeight;
                    element.css('height',totalHeight-130 + 'px');
                }

            }
        };
    }]);
