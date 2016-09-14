'use strict';

/**
 * @ngdoc filter
 * @name clientApp.filter:getListTitleFromId
 * @function
 * @description
 * # getListTitleFromId
 * Filter in the clientApp.
 */
angular.module('clientApp')
  .filter('getListTitleFromId', function () {
    return function (input, lists) {
        var title = 'N/A';
        if(input){
            angular.forEach(lists,function(desk){
                angular.forEach(desk,function(list){
                    if( input == list._id ) { title = list.title }
                });
            });
        }
        return title;
    };
  });
