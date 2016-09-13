'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:dndDropList
 * @description
 * # dndDropList
 */
angular.module('clientApp')
    .directive('dndDropList', [ '$rootScope', '$parse', '$timeout', 'deskLogs',
        function ($rootScope,$parse,$timeout, deskLogs) {
            return function(scope, element, attr){


                element.on('dragenter',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();
                });

                element.on('dragover',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();
                });

                element.on('dragleave',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();
                });

                element.on('drop',function(event){
                    event = event.originalEvent || event;
                    event.preventDefault();

                    var log,
                        transferredObject = event.dataTransfer.getData("Text") ||
                            event.dataTransfer.getData("text/plain");
                    try {
                        log = JSON.parse(transferredObject);
                    } catch(e) {
                        console.error('no dataTransfer, or could not parse dataTransfer');
                        return true;
                    }
                    var dropList = scope.$eval(attr.dndDropList);
                    var currentDate = scope.$eval(attr.dndCurrentDate);
                    console.info(currentDate);
                    deskLogs.dropLogOnList({
                        log: log,
                        list: dropList,
                        sso: $rootScope.user.sso,
                        currentDate: currentDate
                    });

                });

            }
        }]);

