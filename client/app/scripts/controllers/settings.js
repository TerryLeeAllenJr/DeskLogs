'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('SettingsCtrl',[ '$rootScope',
        '$scope',
        '$cookieStore',
        '$http',
        '$location',
        '$uibModal',
        '$sce',
        'authenticate',
        'socket',
        'notifications',
        'deskLogs',
        'history',
        function (
            $rootScope,
            $scope,
            $cookieStore,
            $http,
            $location,
            $uibModal,
            $sce,
            authenticate,
            socket,
            notifications,
            deskLogs,
            history
        ) {

            $scope.user = {};
            $scope.user.img = $scope.user.img || 'http://placehold.it/300x300&text=Coming Soon';
            $scope.form = {};

            $scope.statistics = {};

            var config = {
                    icons: {
                        idle: '<i class="fa fa-check-circle-o" aria-hidden="true"></i>',
                        working: '<i class="fa fa-cog fa-spin fa-fw"></i>',
                        error: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>'
                    },
                    status: {
                        error: {
                            flag: false,
                            pw1 : false,
                            pw2 : false
                        }
                    }
            };


            $scope.status = {
                message: "Idle " + config.icons.idle,
                error: config.status.error
            };

            authenticate.requireLogin()
                .then(function(userData){
                    $scope.user = userData;
                    console.info($scope.user);
                    $rootScope.$emit('loggedIn',userData);
                    socket.emit('setUserData', userData);
                    socket.emit('setJWT', $cookieStore.get('jwt'));

                    history.getHistory($scope.user.sso)
                        .then(function(doc){ $scope.statistics.history = doc; })
                        .catch(function(err){ console.error(err); });

                })
                .catch(function(err){
                    console.error(err);
                    $location.path('/login');
                });

            // Get Desks.
            deskLogs.getDesks()
                .then(function(res){
                    if( !res.status ) { throw new Error('Could not get desk information.'); }
                    $scope.desks = res.data;
                })
                .catch(function(err){
                    console.error(err);
                });

            $scope.saveAccount = function(){
                if( $scope.form.pw1 !== $scope.form.pw2){
                    $scope.status = {
                        message: 'Your passwords do not match! ' + config.icons.error,
                        error: { flag: true, pw1: true, pw2: true }
                    };
                    return false;
                }
                if( $scope.form.pw1.length < 8){
                    $scope.status = {
                        message: 'Your passwords must be at least 8 characters long! ' + config.icons.error,
                        error: { flag: true, pw1: true, pw2: true }
                    };
                    return false;
                }
                $scope.status.error = config.status.error;
                $scope.status.message = "Saving user data " + config.icons.working;
                $scope.user.password = $scope.form.pw1;

                var request = $http.post('/users', $scope.user);
                request.success(function(data){
                    $scope.status.message = "Data has been saved! " + config.icons.idle;
                    //$scope.user = data.data;
                    //$rootScope.$emit('loggedIn',data.data);
                });
                request.error(function(data){
                    $scope.status.error.flag = true;
                    $scope.status.message = "An error occurred saving youd data! " + config.icons.error;
                    console.error(data);
                });

            };

            $scope.updatePreferences = function(){
                var request = $http.post('/users/preferences',$scope.user);


                $scope.status.error = config.status.error;
                $scope.status.message = "Saving user data " + config.icons.working;

                request.success(function(data){
                    console.log(data);
                    $scope.status.message = "Preferences have been updated! " + config.icons.idle;
                });
                request.error(function(data){
                    $scope.status.error.flag = true;
                    $scope.status.message = "An error occurred saving your data! " + config.icons.error;
                })

            };

            $scope.trustHTML = function(html){
                return $sce.trustAsHtml(html);
            }

  }]);
