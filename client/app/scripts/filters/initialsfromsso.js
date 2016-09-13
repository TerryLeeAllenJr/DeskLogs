'use strict';

/**
 * @ngdoc filter
 * @name clientApp.filter:initialsFromSSO
 * @function
 * @description
 * # initialsFromSSO
 * Filter in the clientApp.
 */
angular.module('clientApp')
  .filter('initialsFromSSO', function () {
    return function (input, users) {

        if(input){
            var initials = '';
            angular.forEach(users,function(user,key){
                if(user.sso == input){
                    initials = user.first.charAt(0)+user.last.charAt(0);
                }
            });
            return initials;
        }


    };
  });
