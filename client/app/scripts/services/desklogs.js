'use strict';

/**
 * @ngdoc service
 * @name clientApp.deskLogs
 * @description
 * # deskLogs
 * Service in the clientApp.
 */
angular.module('clientApp')
    .service('deskLogs',
    [
        '$q',
        '$http',
        function ($q, $http) {

            this.updateLocalApplicationData = function (date) {
                return updateLocalApplicationData(date);
            };
            this.getDesks = function () {
                return get('/deskLogs/desks', null);
            };

            this.get = function(url,data) { return get(url,data); };
            this.del = function(url,data) { return del(url,data);};

            /* Lists */
            this.createList = function (data) {
                return post('/deskLogs/lists', data);
            };
            this.updateList = function (data) {
                return post('/deskLogs/lists/update', data);
            };
            this.deleteList = function (data) {
                return del('/deskLogs/lists', data);
            };
            this.getListIndexFromSingleList = function (lists,list) {
                return getListIndexFromSingleList(lists,list);
            };
            this.getDefaultList = function(list){
                return getDefaultList(list);
            };
            this.organizeLists = function (object) {
                return organizeLists(object, 'desk');
            };
            this.getLists = function(date){
                return get('/deskLogs/lists',date);
            };

            this.getPermanentLists = function(){
                return get('deskLogs/lists/permanent');
            };

            /* Logs */
            this.getLogs = function(){
                return get('/deskLogs/logs',null);
            };
            this.getOrphanedLogs = function(){
                return get('/deskLogs/orphans');
            };
            this.getRepeatingStories = function(){
                return get('/deskLogs/logs/repeating/all');
            };
            this.getLogCount = function (lists, logs) {
                return getLogCount(lists, logs);
            };
            this.createLog = function (data) {
                return post('/deskLogs/logs', data);
            };
            this.createRepeatingLog = function(data){
                return post('deskLogs/logs/repeating',data);
            };
            this.updateRepeatingLog = function(data){
                return post('deskLogs/logs/repeating/update', data);
            }
            this.updateLog = function (data) {
                return post('/deskLogs/logs/update', data);
            };
            this.deleteLog = function (data) {
                return del('/deskLogs/logs', data);
            };
            /**
             * Permanently remove a log from the recycle bin.
             * /deskLogs/logs/trash/:id/:sso
             * @param data
             * @returns {*}
             */
            this.trashLog = function(data){
                return del('deskLogs/logs/trash',data);
            };
            this.trashRepeatingLog = function(data){
                return del('deskLogs/logs/repeating',data);
            };
            this.restoreLog = function(data){
                return post('deskLogs/logs/restore',data);
            };
            this.updateLogOrder = function (data) {
                return post('/deskLogs/lists/updateOrder',data);
            };
            this.organizeLogs = function (object) {
                return organizeLogs(object, '_id');
            };
            this.dropLogOnDesk = function (data) {
                return post('/deskLogs/desks/moveLogToDesk', data);
            };
            this.dropLogOnList = function (data) {
                data.currentDate = data.currentDate || new Date();
                return post('/deskLogs/lists/moveLogToList', data);
            };

            /* Server API calls */
            /**
             * Performs a GET request to the specified URL.
             * @param url
             * @returns {*}
             */
            function get(url, data) {
                var defer = $q.defer();
                if (data) {
                    angular.forEach(data, function (value, key) {
                        url += ('/' + value);
                    });
                }
                var request = $http.get(url);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error(err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            /**
             * Performs a POST request to the specified URL with provided var data.
             * @param url
             * @param data
             * @returns {*}
             */
            function post(url, data) {
                var defer = $q.defer();
                var request = $http.post(url, data);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error('ERROR:', err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            /**
             * Performs a DELETE request to the specified url. Attaches [data] to the url string.
             * @param url
             * @param data
             * @returns {*}
             */
            function del(url, data) {
                angular.forEach(data, function (value, key) {
                    url += ('/' + value);
                });
                var defer = $q.defer();
                var request = $http.delete(url, data);
                request.success(function (res) {
                    defer.resolve(res);
                });
                request.error(function (err) {
                    console.error('ERROR:', err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            /* Utilities */
            /**
             * Parses the lists object and provides a log count for each desk. Used to populate the desk tab badges.
             * @param lists
             * @returns {Array}
             */
            function getLogCount(lists, logs) {
                var count = [];
                angular.forEach(lists, function (list, desk) {
                    this[desk] = 0;
                    angular.forEach(list, function (data) {
                        angular.forEach(data.logs, function(logId){
                            if(logs !== null && typeof logs === 'object' && logs.hasOwnProperty(logId)){
                                count[desk] ++;
                            }
                        });
                    }, count);
                }, count);
                return count;
            }

            /**
             * Used to format the raw log data returned from the server into the required data structure.
             * @param object
             * @param objectKey
             * @returns {{}}
             */
            function organizeLogs(object, objectKey) {
                var sorted = {};
                angular.forEach(object, function (value) {
                    sorted[value[objectKey]] = value;
                });
                return sorted;
            }

            /**
             * Used to format the raw list data returned from the server into the the required data structure.
             * @param object
             * @param key
             * @returns {{}}
             */
            function organizeLists(object, key) {
                var sorted = {};
                for (var i = 0; i < object.length; i++) {
                    if (!sorted.hasOwnProperty(object[i][key])) {
                        sorted[object[i][key]] = {};
                    }
                    sorted[object[i][key]][i] = object[i];
                }
                return sorted;
            }

            /**
             * Used to update all application data based on the provided date. Called when a user changes the date on
             * the datepicker.
             * @param date
             * @returns {*}
             */
            function updateLocalApplicationData(date) {
                var defer = $q.defer();
                var data = {};
                get('/deskLogs/desks', null)
                    .then(function(desks){
                        if (!desks.status) { throw new Error('Application bootstrap failed. Could not load desks.'); }
                        data.desks = desks.data;
                        return get('/deskLogs/logs',{date: date});
                    })
                    .then(function(logs){
                        data.logs = organizeLogs(logs.data, '_id');
                        return get('deskLogs/lists',{date: date});
                    })
                    .then(function (lists) {
                        data.lists = organizeLists(lists.data, 'desk');
                        data.count = getLogCount(data.lists, data.logs);
                        return get('users',{});
                    })
                    .then(function(users){
                        data.users = users.data;
                        defer.resolve(data);
                    })
                    .catch(function(err){
                        defer.reject(err);
                    })
                return defer.promise;
            }

            /**
             * Used to  get the correct index from $scope.lists based on a single list entry. Used when directing
             * a command at a single list entry on the view.
             * @param lists
             * @param list
             * @returns {*}
             */
            function getListIndexFromSingleList(lists,list){
                var index = null;
                angular.forEach(lists[list.desk],function(value,key){
                    if(value._id == list._id) { index = key; }
                });
                return index;
            }

            /**
             * Finds the default list in a group of lists.
             * @param lists
             * @returns {*}
             */
            function getDefaultList(lists){
                var defaultList;
                angular.forEach(lists,function(list,key){
                    if(list.defaultList){ defaultList = list; }
                },defaultList);
                return defaultList;
            }

        }]);



