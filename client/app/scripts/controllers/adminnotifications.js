'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AdminnotificationsCtrl
 * @description
 * # AdminnotificationsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('AdminnotificationsCtrl', ['$scope','notifications',function ($scope, notifications) {

        console.info('AdminnotificationsCtrl called...');
        $scope.notification = {
            type:'info',
            config: {
                title: '',
                ttl: "-1"
            },
            text: ''
        };

        $scope.submit = function(){
            var notification = angular.copy($scope.notification);
            notification.config.ttl = parseInt($scope.notification.config.ttl);

            notifications.sendGlobalNotification(notification)
                .then(function(){
                    console.info('Notification sent.');
                })
                .catch(function(err){
                    console.error(err);
                    notifications.createPopup({
                        type:'error',
                        config: {title:'Notification Error'},
                        text: err
                    });
                });

        };

        console.info($scope.notification);

  }]);
