'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */

/*
TODO: Setup notification system.
TODO: Setup admin page.
TODO: Setup cron jobs. (populate daily logs, backups, garbage collection.)
TODO: Setup Help page.
TODO: Create Feedback feature.
TODO: Setup Forgot Password feature.
 */

angular.module('clientApp')

    .controller('MainCtrl',
    [
        '$rootScope',
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
        'hotkeys',
        function ($rootScope, $scope, $cookieStore, $http, $location, $uibModal, $sce, authenticate, socket, notifications, deskLogs, hotkeys) {

            /* Configuration. */
            var config = {
                log: {
                    _id: '',
                    type: '',
                    itemno: '',
                    slug: '',
                    timeIn: '',
                    timeOut: '',
                    rt: '',
                    source: '',
                    feed: '',
                    format: '',
                    wr: '',
                    updatedBy: '',
                    createdBy: ''
                }
            };

            /* Utilities */
            /**
             * Allow passing messages from the view with ng-init.
             * @param message
             */
            $scope.log = function (message) { console.info('From template:', message); };

            // Bootstrap the application.
            $scope.selectedLog = angular.copy(config.log);        // Currently selected log.
            $scope.currentDesk = 'incoming';                      // Current "desk" selected.


            // Datepicker
            $scope.datepicker = {};
            $scope.datepicker.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.datepicker.format = $scope.datepicker.formats[0];
            $scope.datepicker.altInputFormats = ['M!/d!/yyyy'];
            $scope.datepicker.opened = false;
            $scope.datepicker.open = function () { $scope.datepicker.opened = true; };
            $scope.datepicker.options = {
                formatYear: 'yy',
                maxDate: null,
                minDate: new Date(2016, 1, 1),
                startingDay: 1
            };

            $scope.trustHTML = function(html){
                return $sce.trustAsHtml(html);
            };


            // Set todays date as default.
            $scope.today = function(){
                // This is also called by the datepicker directive inside the deskLogs directive.
                $scope.currentDate = new Date();
                //$scope.today = angular.copy($scope.currentDate);
            };
            $scope.clear = function(){
                // This is also called by the datepicker directive inside the deskLogs directive.
                $scope.currentDate = null;
            };
            $scope.today();

            // Require the user to be logged in before continuing.
            authenticate.requireLogin()
                .then(function (userData) {
                    $rootScope.user = userData;
                    $rootScope.$emit('loggedIn',userData);       // Tells the navigation bar that the user is logged in.
                })
                .catch(function (err) {
                    console.error(err);
                    $location.path('/login');                   // If the user can not be authenticated, back to login.
                });

            /*  Watches the $scope.currentDate variable. Will retrieve the appropriate data from mongo when the date is
                changed. This will fire at the initial page load due to today() being called as part of the bootstrap
                routine. This is intentional. */
            $scope.$watch('currentDate',function(){
                deskLogs.updateLocalApplicationData($scope.currentDate)
                    .then(function(data){
                        $scope.desks = data.desks;
                        $scope.lists = data.lists;
                        $scope.logs  = data.logs;
                        $scope.count = data.count;
                        $scope.users = data.users;
                        $scope.defaultList = deskLogs.getDefaultList($scope.lists[$scope.currentDesk]);
                    })
                    .catch(function(err){
                        console.error(err);
                    });
            });

            /* Permission TODO: Move to Auth module. */
            /**
             * Checks to see if the user has administrative rights. Looks at the $scope.users.permissions array
             * to see if the provided (string) permissionType is in the array.
             * @param permissionType
             * @returns {userSchema.permissions|*|Query.permissions|boolean}
             */
            $scope.hasPermission = function(permissionType){
                if(!$scope.user){ return false; }
                return authenticate.hasPermission($scope.user,permissionType);
            };

            /* Navigation */
            /**
             * Handles desk selection on the main tabs.
             * @param title
             * @param e
             */
            $scope.selectTab = function (title, e) {
                e.preventDefault();
                $scope.selectedLog = angular.copy(config.log);
                $scope.currentDesk = title;
                $scope.defaultList = deskLogs.getDefaultList($scope.lists[$scope.currentDesk]);
            };

            /* Lists */
            /**
             * List modal window for new list item.
             */
            $scope.createListEntry = function(){
                //$scope.listEntry = {};
                $scope.listModal = $uibModal.open({
                    animation:true,
                    templateUrl: '../../views/templates/modalListEntry.html',
                    controller: 'ModalCtrl',
                    size: 'sm',
                    resolve: {
                        data: function(){
                            var data = {
                                desks: $scope.desks,
                                form: {desk: $scope.currentDesk},
                                title: 'Create New List'
                            };
                            return data;
                        },
                        submit: function(){ return function(listEntry){
                            listEntry.createdAt = $scope.currentDate;
                            var data = { list: listEntry, sso: $rootScope.user.sso, currentWorkingDate: $scope.currentDate };
                            deskLogs.createList(data)
                                .then(function () {
                                    notifications.createPopup({
                                        type: 'success',
                                        config: {title: 'List Added'},
                                        text: "Your list was successfully added!"
                                    });
                                })
                                .catch(function (err) {
                                    console.error(err);
                                    notifications.createPopup({
                                        type: 'error',
                                        config: {title: 'List Not Added', ttl: -1},
                                        text: err
                                    });
                                });
                        }}
                    }
                });
            };
            /**
             * Handles the edit list icon click event.
             **/
            $scope.editListEntry = function (list) {
                if(list.locked === true) {
                    notifications.createPopup({
                        type: 'warning',
                        config: {title: 'Editing in Progress'},
                        text: "This list is currently open for editing in another browser. Please wait for the " +
                        "spinning icon to disappear before trying again."
                    });
                    return false;
                }
                socket.lockListEntry(list);
                $scope.listModal = $uibModal.open({
                    animation:true,
                    templateUrl: '../../views/templates/modalListEntry.html',
                    controller: 'ModalCtrl',
                    size: 'sm',
                    resolve: {
                        data: function(){
                            var data = {
                                desks: $scope.desks,
                                form: list,
                                title: 'Edit List'
                            };
                            return data;
                        },
                        submit: function(){ return function(listEntry){

                            var data = {
                                list: listEntry,
                                sso: $rootScope.user.sso,
                                currentWorkingDate: $scope.currentDate
                            };
                            socket.unlockListEntry(list);
                            deskLogs.updateList(data)
                                .then(function () {
                                    notifications.createPopup({
                                        type: 'success',
                                        config: {title: 'List Modified'},
                                        text: "Your list was successfully changed!"
                                    });
                                })
                                .catch(function (err) {
                                    console.error(err);
                                    notifications.createPopup({
                                        type: 'error',
                                        config: {title: 'List Not Modified', ttl: -1},
                                        text: err
                                    });
                                });
                        }}
                    }
                });
                $scope.listModal.result.then(function(){},function(){
                    socket.unlockListEntry(list);
                });
            };
            /**
             * Handles deleting a list entry.
             */
            $scope.deleteListEntry = function (_id) {
                if (!confirm('Are you sure you want to delete this list? ' +
                    'Any logs currently under this list will be lost.')) {
                    return false;
                }
                deskLogs.deleteList({id: _id, sso: $rootScope.user.sso})
                    .then(function (res) {
                        notifications.createPopup({
                            type: 'success',
                            config: {title: 'List Deleted'},
                            text: "Your list was deleted successfully!"
                        });
                    })
                    .catch(function (err) {
                        console.error(err);
                        notifications.createPopup({
                            type: 'error',
                            config: {title: 'List Not Deleted', ttl: -1},
                            text: err
                        });
                    });
            };

            /* Logs */
            /**
             * Handles creating the Log modal.
             */
            $scope.createLogEntry = function () {
                $scope.selectedLog = angular.copy(config.log);
                $scope.logModal = $uibModal.open({
                    animation: true,
                    templateUrl: '../../views/templates/modalLogEntry.html',
                    controller: 'ModalCtrl',
                    size: 'lg',
                    resolve: {
                        data: function(){
                            var data = {
                                title: 'Create New Story',
                                currentDesk: $scope.currentDesk,
                                lists: $scope.lists,
                                users: $scope.users,
                                form: {
                                    selectedList: $scope.defaultList._id,
                                    activeDate: $scope.currentDate
                                }
                            };
                            return data;
                        },
                        submit: function(){ return function(logEntry){
                            var data = {};
                            data.selectedList = logEntry.selectedList;
                            data.currentWorkingDate = $scope.currentDate;
                            data.sso = $rootScope.user.sso;
                            //delete(logEntry.selectedList);
                            data.log = logEntry;
                            data.log.updatedBy = $rootScope.user.sso;
                            data.log.createdBy = $rootScope.user.sso;
                            data.log.createdAt = $scope.currentDate;
                            deskLogs.createLog(data)
                                .then(function(){
                                    notifications.createPopup({
                                        type: 'success',
                                        config: {title: 'Story Added'},
                                        text: "Your log was successfully added!"
                                    });
                                })
                                .catch(function(err){
                                    console.error(err);
                                    notifications.createPopup({
                                        type: 'err',
                                        config: {title: 'Story Not Added', ttl: -1},
                                        text: err
                                    });
                                });
                        }}
                    }
                });
            };

            /**
             * Handles the edit log toolbox click event.
             */
            $scope.editLogEntry = function () {
                if($scope.logs[$scope.selectedLog._id].locked === true){
                    notifications.createPopup({
                        type: 'warning',
                        config: {title: 'Editing in Progress'},
                        text: "This story is currently open for editing in another browser. Please wait for the " +
                        "spinning icon to disappear before trying again."
                    });
                    return false;
                }

                socket.lockLogEntry($scope.selectedLog);

                $scope.logModal = $uibModal.open({
                    animation: true,
                    templateUrl: '../../views/templates/modalLogEntry.html',
                    controller: 'ModalCtrl',
                    size: 'lg',
                    resolve: {
                        data: function(){
                            var data = {
                                    title: 'Edit Story',
                                    currentDesk: $scope.currentDesk,
                                    lists: $scope.lists,
                                    users: $scope.users,
                                    form: $scope.selectedLog
                                };
                            data.form.activeDate = new Date($scope.selectedLog.activeDate);
                            return data;
                        },
                        submit: function(){ return function(logEntry){
                            var data = {};
                            data.selectedList = logEntry.selectedList;
                            data.currentWorkingDate = $scope.currentDate;
                            data.sso = $rootScope.user.sso;
                            data.log = angular.copy(logEntry);
                            data.log.updatedBy = $rootScope.user.sso;
                            delete data.log.selectedList;
                            deskLogs.updateLog(data)
                                .then(function(){
                                    socket.unlockLogEntry($scope.selectedLog);
                                    notifications.createPopup({
                                        type: 'success',
                                        config: {title: 'Story Modified'},
                                        text: "Your story was successfully modified!"
                                    });
                                })
                                .catch(function(err){
                                    console.error(err);
                                    notifications.createPopup({
                                        type: 'error',
                                        config: {title: 'Story Not Mofified', ttl: -1},
                                        text: err
                                    });
                                });
                        }}
                    }
                });

                $scope.logModal.result.then(function(){},function(){
                    socket.unlockLogEntry($scope.selectedLog);
                });

            };
            /**
             * Handles the delete log toolbox click event.
             * @returns {boolean}
             */
            $scope.deleteLogEntry = function () {
                if (!confirm('Are you sure you want to delete this story? ')) { return false; }

                var data = {_id: $scope.selectedLog._id, sso: $rootScope.user.sso, date: $scope.currentDate };
                deskLogs.deleteLog( data )
                    .then(function (res) {
                        $scope.selectedLog = angular.copy(config.log);
                        notifications.createPopup({
                            type: 'success',
                            config: {title: 'Story Deleted'},
                            text: "Your story was deleted, but can be restored in the Admin Panel."
                        });
                    })
                    .catch(function (err) {
                        console.error(err);
                        notifications.createPopup({
                            type: 'error',
                            config: {title: 'Story Not Deleted', ttl: -1},
                            text: err
                        });
                    });
            };
            /**
             * Handles the select log click event.
             * @param _id
             * @param list
             */
            $scope.selectLog = function (_id, list) {
                $scope.selectedLog = angular.copy($scope.logs[_id]);
                $scope.selectedLog.selectedList = list;
            };

            // Hotkeys setup.
            hotkeys.add({
                combo: 'shift+s',
                description: 'Create a new story.',
                callback: function(){
                    $scope.createLogEntry();
                }
            });
            hotkeys.add({
                combo: 'shift+l',
                description: 'Create a new list.',
                callback: function(){
                    $scope.createListEntry();
                }
            });
            hotkeys.add({
                combo: 'shift+z',
                description: 'Delete selected story.',
                callback: function(){
                    $scope.deleteLogEntry();
                }
            });
            hotkeys.add({
                combo: 'shift+e',
                description: 'Edit selected story.',
                callback: function(){
                    $scope.editLogEntry();
                }
            });

            /* Sockets  */


            function isSameDate(a,b){
                a = new Date(a);
                b = new Date(b);
                return (
                    a.getFullYear() === b.getFullYear() &&
                    a.getMonth() === b.getMonth() &&
                    a.getDate() === b.getDate()
                );
            }

            /**
             * Responsible for updating the entire UI. Triggered by server when the data model is updated.
             */
            socket.on('updateApplication', function (msg) {
                if(isSameDate($scope.currentDate,msg.date)){
                    $scope.logs = deskLogs.organizeLogs(msg.logs, '_id');
                    $scope.lists = deskLogs.organizeLists(msg.lists);
                    $scope.count = deskLogs.getLogCount($scope.lists, $scope.logs);
                    $scope.$apply();
                }
            });
            /**
             * Responsible for updating $scope.logs individually. Called when a log is modified.
             */
            socket.on('updateAppLogs', function (msg) {
                if(isSameDate($scope.currentDate,msg.date)){
                    $scope.logs = deskLogs.organizeLogs(msg.logs,'_id');
                    $scope.$apply();
                }
            });
            /**
             * Responsible for updating $scope.lists individually. Called when the list is modified.
             */
            socket.on('updateAppLists', function (msg) {
                $scope.lists = deskLogs.organizeLists(msg.lists);
                $scope.count = deskLogs.getLogCount($scope.lists, $scope.logs);
                $scope.$apply();
            });

            /**
             * Locks a log for all users one someone starts editing it.
             */
            socket.on('lockLogEntry',function(selectedLog){
                if($scope.logs[selectedLog._id]){
                    $scope.logs[selectedLog._id].locked = true;
                    $scope.$apply();
                }

            });
            /**
             * Unlocks a log for all users one someone starts editing it.
             */
            socket.on('unlockLogEntry',function(selectedLog){
                if($scope.logs[selectedLog._id]){
                    $scope.logs[selectedLog._id].locked = false;
                    $scope.$apply();
                }
            });
            /**
             * Locks a list for all users one someone starts editing it.
             */
            socket.on('lockListEntry',function(list){
                var index = deskLogs.getListIndexFromSingleList($scope.lists,list);
                $scope.lists[list.desk][index].locked = true;
                $scope.$apply();
            });
            /**
             * Unlocks a list for all users one someone starts editing it.
             */
            socket.on('unlockListEntry',function(list){
                var index = deskLogs.getListIndexFromSingleList($scope.lists,list);
                $scope.lists[list.desk][index].locked = false;
                $scope.$apply();
            });

        }]);