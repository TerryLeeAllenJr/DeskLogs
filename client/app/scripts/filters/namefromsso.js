'use strict';

/**
 * @ngdoc filter
 * @name clientApp.filter:nameFromSSO
 * @function
 * @description
 * # nameFromSSO
 * Filter in the clientApp.
 */
angular.module('clientApp')
  .filter('nameFromSSO', function () {
        return function (input, users) {
            if(input){
                var name = 'N/A';
                angular.forEach(users,function(user){
                    if(user.sso == input){ name = user.first + ' ' + user.last; }
                });
                return name;
            }
        };
  });
