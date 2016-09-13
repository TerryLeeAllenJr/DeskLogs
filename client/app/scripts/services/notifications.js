'use strict';

/**
 * @ngdoc service
 * @name clientApp.notifications
 * @description
 * # notifications
 * Factory in the clientApp.
 */
angular.module('clientApp')
    .factory('notifications', [
        '$rootScope',
        '$q',
        '$http',
        'webNotification',
        'socket',
        'sounds',
        'growl', function ($rootScope, $q, $http, webNotification, socket, sounds, growl) {
            /**
             *
             * @param data {type: [ALERT_TYPE], text: [ALERT_TEXT],config: {[CONFIG](title: ttl:)}
             */
            function createPopup(data){
                switch(data.type){
                    case 'warning':
                        growl.warning(data.text,data.config);
                        sounds.playSound('warning');
                        break;
                    case 'error':
                        growl.error(data.text,data.config);
                        sounds.playSound('error');
                        break;
                    case 'success':
                        growl.success(data.text,data.config);
                        sounds.playSound('success');
                        break;
                    case 'info':
                        growl.info(data.text,data.config);
                        sounds.playSound('info');
                        break;
                    default:
                        growl.info(data.text,data.config);
                }
            }

            function createNotification(notification){
                createPopup(notification);
            }

            function sendGlobalNotification(notification){
                console.info('send global notification',notification);
                var defer = $q.defer();
                var request = $http.post('/notifications/global', notification);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error(err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            return {
                createPopup: function(notification){ return createPopup(notification); },
                createNotification: function(notification){ return createNotification(notification); },
                sendGlobalNotification: function(notification) { return sendGlobalNotification(notification); }
            };
        }]);


/*
 displayDesktopNotification: function (notification) {
 webNotification.showNotification(notification.title || '', {
 body: notification.body || '',
 icon: 'my-icon.ico',
 onClick: function onNotificationClicked() {
 hide();
 },
 autoClose: 4000
 }, function onShow(error, hide) {
 if (error) {
 window.alert('Unable to show notification: ' + error.message);
 }
 });
 }
 */