'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */

// RESET COOKIE HERE FOR LOGOUT.

angular.module('clientApp')
    .controller('LoginCtrl', [
        '$q',
        '$cookieStore',
        'authenticate',
        '$scope',
        '$http',
        '$location',
        'notifications',
        'socket',
        function ($q, $cookieStore, authenticate, $scope, $http, $location, notifications,socket) {

            authenticate.logOut();

            $scope.submit = function () {
                authenticate.createJSONWebToken($scope.login)
                    .then(function(res){
                        if(!res.status){
                            notifications.createPopup({
                                type: 'error',
                                config: {title: 'Login Error'},
                                text: res.data
                            });
                            $scope.login.pw = "";
                        }
                        else{
                            $cookieStore.put('jwt',{sso: $scope.login.sso, token: res.data} );
                            $location.path('/');
                        }
                    })
                    .catch(function(err){
                        console.error(err);
                        $scope.login = "";
                        notifications.createPopup({
                            type: 'error',
                            config: {title: 'Internal Error'},
                            text: "There was an error processing your login."
                        });
                    });
            }
        }]);
