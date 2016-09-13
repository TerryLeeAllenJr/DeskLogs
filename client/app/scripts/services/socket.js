'use strict';

/**
 * @ngdoc service
 * @name clientApp.socket
 * @description
 * # socket
 * Factory in the clientApp.
 */
angular.module('clientApp')
    .factory('socket', ['$rootScope', function ($rootScope) {
        var socket = io.connect();


        var on = function(eventName, cb) { socket.on(eventName, cb); },
            emit = function(eventName, cb) { socket.emit(eventName, cb);};

        var lockLogEntry = function(log){ emit('lockLogEntry',log);},
            unLockLogEntry = function(log){ emit('unlockLogEntry',log);},
            lockListEntry = function(list){ emit('lockListEntry',list);},
            unlockListEntry = function(list) { emit('unlockListEntry',list); };

        return {
            on: on,
            emit: emit,
            lockLogEntry: lockLogEntry,
            unlockLogEntry: unLockLogEntry,
            lockListEntry: lockListEntry,
            unlockListEntry: unlockListEntry
        };
    }]);
