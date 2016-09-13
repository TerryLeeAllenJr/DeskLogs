'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('ModalCtrl', ['$scope', '$uibModalInstance', 'socket', 'data', 'submit', 'hotkeys',
        function ($scope, $uibModalInstance, socket, data, submit, hotkeys) {


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
            $scope.today = function(){
                $scope.form.activeDate = new Date();
            };
            $scope.clear = function(){
                $scope.form.activeDate = null;
            };

            $scope.panelTitle = data.title;
            $scope.panelLocked = false;
            $scope.tooltips = {
                lock: "Click the lock to keep this panel open after saving."
            };

            $scope.wysiwyg = {
                buttons: [
                    ['bold', 'italic', 'underline', 'strikethrough'],
                    ['left-justify', 'center-justify', 'right-justify'],
                    ['ordered-list', 'unordered-list'],
                    ['font-color']
                ]
            };


            // Setup the scope values from var data.
            angular.forEach(data, function (value, key) {
                this[key] = value;
            }, $scope);

            $scope.togglePanelLock = function () {
                $scope.panelLocked = !$scope.panelLocked;
            };


            $scope.submit = function () {
                submit($scope.form);
                if (!$scope.panelLocked) {
                    $uibModalInstance.close(null);
                }
            };
            $scope.close = function () {
                $uibModalInstance.dismiss('cancel');
            };

            hotkeys.add({
                combo: 'shift+l',
                description: 'Toggle Panel Lock',
                callback: function () {
                    $scope.togglePanelLock();
                }
            });


        }]);