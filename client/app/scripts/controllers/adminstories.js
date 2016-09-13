'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AdminstoriesCtrl
 * @description
 * # AdminstoriesCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('AdminstoriesCtrl', [
        '$rootScope',
        '$scope',
        '$q',
        '$uibModal',
        'deskLogs',
        'notifications',
        function ($rootScope,$scope, $q, $uibModal, deskLogs, notifications) {

            $scope.stories = [];

            // Bootstrap controller.
            getPermanentLists();
            getOrphanedStories();
            getUsers();


            $scope.getOrphanedStories = function(){ return getOrphanedStories();};
            $scope.getRepeatingStories = function(){ return getRepeatingStories(); };

            $scope.searchStories = function (e) {
                e.preventDefault();
                //getStories();
            };


            /* Recycle Bin */
            $scope.deleteAllStories = function(){
                if (!confirm('Are you sure you want to permanently delete all stories from the bin? ')) { return false; }
                $scope.loading = true;
                var defer = $q.defer();
                $q.all($scope.stories.map(function(story){
                    deskLogs.trashLog(story._id)
                        .then(function(doc){ defer.resolve(doc); })
                        .catch(function(err) { defer.reject(err); });
                }))
                    .then(function(){
                        $scope.getOrphanedStories();
                        notifications.createPopup({
                            type: 'success',
                            config: {title: 'Success'},
                            text: 'All stories were permanently removed.'
                        });
                    })
                    .catch(function(err){
                        $scope.loading = false;
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });
            };
            $scope.deleteStory = function(key,_id){
                if (!confirm('Are you sure you want to permanently delete this story? ')) { return false; }
                deskLogs.trashLog([_id,$rootScope.user.sso])
                    .then(function(res){
                        console.info(res);
                        $scope.stories.splice(key,1);
                        notifications.createPopup({
                            type: 'success',
                            config: {title: 'Success'},
                            text: 'The story was permanently removed from the database.'
                        });
                    })
                    .catch(function(err){
                        console.error(err);
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });

            };
            $scope.restoreStory = function(key,_id){
                if (!confirm('Are you sure you want to restore this story? ')) { return false; }
                deskLogs.restoreLog({_id: _id})
                    .then(function(res){
                        $scope.stories.splice(key,1);
                        notifications.createPopup({
                            type: 'success',
                            config: {title: 'Success'},
                            text: 'The story was returned to the DeskLog.'
                        });
                    })
                    .catch(function(err){
                        console.error(err);
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });
            };

            /* Repeating Stories */
            $scope.createRepeatingStory = function(){
                $scope.logModal = $uibModal.open({
                    animation: true,
                    templateUrl: '../../views/templates/modalRepeatingLogEntry.html',
                    controller: 'ModalCtrl',
                    size: 'lg',
                    resolve: {
                        data: function(){
                            var data = {
                                title: 'Create New Repeating Story',
                                users: $scope.users,
                                lists: $scope.lists,
                                form: {}
                            };
                            return data;
                        },
                        submit: function(){ return function(logEntry){
                            logEntry.createdBy = $rootScope.user.sso;
                            logEntry.updatedBy = $rootScope.user.sso;
                            deskLogs.createRepeatingLog(logEntry)
                                .then(function(res){
                                    logEntry.createdAt = new Date();
                                    $scope.stories.unshift(logEntry);
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
            $scope.deleteRepeatingStory = function(key,_id){
                if (!confirm('Are you sure you want to permanently delete this repeating story? ')) { return false; }
                deskLogs.trashRepeatingLog([_id])
                    .then(function(res){
                        console.info(res);
                        $scope.stories.splice(key,1);
                    })
                    .catch(function(err){
                        console.error(err);
                        notifications.createPopup({
                            type: 'error',
                            config: {title: 'Story Not Added', ttl: -1},
                            text: err
                        });
                    });
            };
            $scope.editRepeatingStory   = function(key,story){
                $scope.logModal = $uibModal.open({
                    animation: true,
                    templateUrl: '../../views/templates/modalRepeatingLogEntry.html',
                    controller: 'ModalCtrl',
                    size: 'lg',
                    resolve: {
                        data: function(){
                            var data = {
                                title: 'Edit Repeating Story',
                                users: $scope.users,
                                lists: $scope.lists,
                                form: story
                            };
                            return data;
                        },
                        submit: function(){ return function(logEntry){
                            logEntry.updatedBy = $rootScope.user.sso;


                            console.info('logEntry',logEntry);

                            deskLogs.updateRepeatingLog(logEntry)
                                .then(function(res){
                                    console.info(res);
                                    $scope.stories[key] = res.data;
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


            function getAllStories(){
                $scope.stories = [];
                $scope.loading = true;
                deskLogs.getLogs()
                    .then(function (doc) {
                        $scope.stories = doc.data;
                        $scope.loading = false;
                    })
                    .catch(function (err) {
                        $scope.loading = false;
                        console.error(err);
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });
            }


            /**
             * Gets a list of all repeating lists and organizes them into an object. {desk: [lists]}
             */
            function getPermanentLists(){
                deskLogs.getPermanentLists()
                    .then(function(res){
                        $scope.lists = deskLogs.organizeLists(res.data)
                        console.info($scope.lists);
                    })
                    .catch(function(err){
                        $scope.lists = {};
                        console.err(err);
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });
            }
            /**
             * Gets the list of all stories that do not currently belong to a list.
             */
            function getOrphanedStories() {
                $scope.stories = [];
                $scope.loading = true;
                deskLogs.getOrphanedLogs()
                    .then(function(doc){
                        $scope.stories = doc.data;
                        $scope.loading = false;
                    })
                    .catch(function(err){
                        $scope.loading = false;
                        console.error(err);
                        notifications.createErrorPopUp({text: err, title: 'Error getting orphaned logs.'});
                    });
            }

            /**
             * Gets a list of all repeating stories.
             */
            function getRepeatingStories(){
                console.info('getRepeatingStories()');
                $scope.loading = true;
                $scope.stories = [];
                deskLogs.getRepeatingStories()
                    .then(function(doc){
                        $scope.stories = doc.data;
                        $scope.loading = false;
                    })
                    .catch(function(err){
                        console.error(err);
                        $scope.loading = false;
                        notifications.createPopup({
                            type: 'err',
                            config: {title: 'Error', ttl: -1},
                            text: err
                        });
                    });
            }
            /**
             * Gets a list of all registered users. Used to display name based on SSO
             */
            function getUsers(){
                deskLogs.get('users',{})
                    .then(function(res){
                        $scope.users = res.data;
                    })
                    .catch(function(err){
                        console.error(err);
                        notifications.createErrorPopUp({text: err, title: 'Error getting user list.'});
                    });
            }

        }]);
