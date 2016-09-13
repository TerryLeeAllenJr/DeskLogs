'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('NavigationCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$uibModal',
        '$cookieStore',
        'authenticate',
        'notifications',
        'socket',
        function ($rootScope,$scope, $http, $timeout, $uibModal, $cookieStore, authenticate, notifications, socket) {


            $scope.sound = false;
            $scope.onlineUsers = [];

            $scope.toggleSound = function($event){
                $event.preventDefault();
                $scope.sound = !$scope.sound;

                if(!$rootScope.hasOwnProperty('user')){
                    $rootScope.user = {preferences: {sound: $scope.sound}};
                }
                else{
                    $rootScope.user.preferences.sound = $scope.sound;
                }

                notifications.createPopup({
                    type: 'info',
                    config: {title: 'Sound settings changed!'},
                    text: "Your sound settings were successfully changed."
                });

            };

            $scope.hasPermission = function(permissionType){
                if(!$scope.user){ return false; }
                return authenticate.hasPermission($scope.user,permissionType);
            };


            $scope.animate = false;

            $rootScope.$on('updateNotifications',function(e,notifications){
                $timeout(function(){
                    $scope.notifications = notifications;
                    $scope.notificationCount = notifications.length;
                    $scope.animate = true;
                    setTimeout(function(){
                        $scope.animate = false;
                    },3000);
                });
            });

            $scope.launchFeedback = function(e){
                e.preventDefault();
                $scope.logModal = $uibModal.open({
                    animation: true,
                    templateUrl: '../../views/templates/modalFeedbackEntry.html',
                    controller: 'ModalCtrl',
                    size: 'lg',
                    resolve: {
                        data: function(){
                            var data = {form: {}};
                            return data;
                        },
                        submit: function(){ return function(feedback){

                            feedback.user = $rootScope.user.sso;

                            var request = $http.post('/feedback', feedback);
                            request.success(function (res) {

                                if(res.status){
                                    notifications.createPopup({
                                        type: 'success',
                                        config: {title: 'Feedback Sent'},
                                        text: "Your feedback has been recorded and an email has been sent. You should " +
                                        "receive a copy of this email shortly!"
                                    });
                                }
                                else{
                                    console.error(res.data);
                                    notifications.createPopup({
                                        type: 'error',
                                        config: {title: 'Feedback Not Sent', ttl: -1},
                                        text: "There was an error sending your feedback. If you are receiving this " +
                                        "message, something has gone wrong in the server. Please contact support."
                                    });
                                }
                            });
                            request.error(function (err) {
                                console.error(err);
                                notifications.createPopup({
                                    type: 'error',
                                    config: {title: 'Feedback Not Sent', ttl: -1},
                                    text: "There was an error sending your feedback. If you are receiving this " +
                                    "message, something has gone wrong in the server. Please contact support."
                                });
                            });
                        }}
                    }
                });




            };

            $rootScope.$on('loggedIn', function (event, user) {
                $scope.loggedIn = true;
                $scope.username = user.first + " " + user.last;
                socket.emit('setUserOnline',user.sso);
                socket.emit('setJWT', $cookieStore.get('jwt'));
                $scope.user = user;
            });

            $rootScope.$on('loggedOut', function (event, user) {
                $scope.loggedIn = false;
                $scope.username = "Logged Out...";
            });



            /* Notification Handler. */
            socket.on('notification',function(notification){
                notifications.createNotification(notification);
            });
            socket.on('popup',function(notification){
                notifications.createPopup(notification);
            });

            socket.on('updateOnlineUsers',function(users){
                $scope.onlineUsers = users;
            });

            socket.on('pollUsers',function(){
            });

        }]);
