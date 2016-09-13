'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AdminmonitorCtrl
 * @description
 * # AdminmonitorCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('AdminmonitorCtrl', ['$scope', 'monitor',function ($scope, monitor) {
        $scope.status = {};
        setInterval(function(){
            monitor.getCurrentStatus()
                .then(function(res){ $scope.status = res.data; })
                .catch(function(err){ console.error(err); });
        },5000);
  }]);