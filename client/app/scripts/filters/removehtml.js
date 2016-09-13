'use strict';

/**
 * @ngdoc filter
 * @name clientApp.filter:removeHTML
 * @function
 * @description
 * # removeHTML
 * Filter in the clientApp.
 */
angular.module('clientApp')
  .filter('removeHTML', function () {
    return function (input) {
      return input ? String(input).replace(/<[^>]+>/gm, '') : '';
    };
  });
