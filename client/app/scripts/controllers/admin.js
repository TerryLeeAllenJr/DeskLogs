'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AdminCtrl
 * @description
 * # AdminCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('AdminCtrl', [
        '$rootScope',
        '$scope',
        '$cookieStore',
        '$http',
        '$location',
        '$uibModal',
        'authenticate',
        'socket',
        'notifications',
        'deskLogs',
        'hotkeys',
        function ($rootScope, $scope, $cookieStore, $http, $location, $uibModal, authenticate, socket, notifications, deskLogs, hotkeys) {


            $scope.loading = false;
            // Require the user to be logged in before continuing.
            authenticate.requireLogin()
                .then(function (userData) {
                    $rootScope.user = userData;
                    $rootScope.$emit('loggedIn', userData);       // Tells the navigation bar that the user is logged in.
                    // Tells the server about the user.
                    socket.emit('setUserData', {userData: userData, currentDate: $scope.currentDate});
                    socket.emit('setJWT', $cookieStore.get('jwt'));
                })
                .catch(function (err) {
                    console.error(err);
                    $location.path('/login');                   // If the user can not be authenticated, back to login.
                });


            $scope.menuClosed = false;
            $scope.currentPage = 'stories';
            $scope.changePage = function (page, e) {
                e.preventDefault();
                $scope.currentPage = page;
            };

            $scope.toggleMenu = function () {
                $scope.menuClosed = !$scope.menuClosed;
            };


        }]);