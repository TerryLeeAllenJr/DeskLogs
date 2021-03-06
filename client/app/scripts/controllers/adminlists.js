'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AdminlistsCtrl
 * @description
 * # AdminlistsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('AdminlistsCtrl', [
        '$scope',
        'socket',
        'deskLogs',
        'notifications', function ($scope, socket, deskLogs, notifications) {

            $scope.currentDate = new Date();
            bootstrap();


            function bootstrap(){
                deskLogs.getDesks()
                    .then(function (res) {
                        $scope.desks = res.data;
                        return deskLogs.getLists([$scope.currentDate]);
                    })
                    .then(function (res) {
                        $scope.lists = deskLogs.organizeLists(res.data, 'desk');
                    })
                    .catch(function (err) {
                        console.error(err);
                        notifications.createPopup({
                            type: 'error',
                            config: {title: 'Internal Error', ttl: -1},
                            text: err
                        });
                    });
            }



        }]);
