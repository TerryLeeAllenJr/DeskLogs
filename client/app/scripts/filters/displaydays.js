'use strict';

/**
 * @ngdoc filter
 * @name clientApp.filter:displayDays
 * @function
 * @description
 * # displayDays
 * Filter in the clientApp.
 */
angular.module('clientApp')
  .filter('displayDays', function () {
    return function (input) {
        var days = "";
        angular.forEach(input,function(value,day){
            if(value){ days += day+','}
        });
        return days.replace(/,\s*$/, "");;
    };
  });
