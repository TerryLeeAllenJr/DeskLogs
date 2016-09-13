'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:dndDropDesk
 * @description
 * # dndDropDesk
 */
angular.module('clientApp')
    .directive('dndDropDesk', [ '$rootScope','$parse', '$timeout', 'deskLogs',
        function ($rootScope, $parse,$timeout, deskLogs) {
            return function(scope, element, attr){


                element.on('dragenter',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();
                });

                element.on('dragover',function(event){
                    event = event.originalEvent || event;

                    // Add event indicators for both acceptable and unacceptable items to be dropped here.
                    event.preventDefault();
                });

                element.on('dragleave',function(event){
                    event = event.originalEvent || event;
                    console.info('dragleave');
                    event.preventDefault();
                });

                element.on('drop',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();
                    var log = event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain");
                    var transferredObject;
                    try {
                        transferredObject = JSON.parse(log);
                    } catch(e) {
                        console.error('no dataTransfer, or could not parse dataTransfer');
                        return true;
                    }
                    if(!transferredObject.logId) { return true; } // Only accept logs on the desk tab.
                    var desk = scope.$eval(attr.dndDropDesk);
                    deskLogs.dropLogOnDesk({log:transferredObject, desk: desk, sso: $rootScope.user.sso});
                });

            }
        }]);

