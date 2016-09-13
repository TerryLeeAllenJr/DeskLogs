'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:dndDragLog
 * @description
 * # dndDragLog
 */
angular.module('clientApp')
  .directive('dndDragLog', [ '$parse', '$timeout', 'deskLogs', 'socket', 'notifications',
        function ($parse,$timeout, deskLogs, socket, notifications) {
    return function(scope, element, attr){

        // Allow the element to be dragged.
        element.attr("draggable","true");


        /**
         * Processes what happens when the drag event starts. This will check if the story is being edited, and prevent
         * further action if it is.
         */
        element.on('dragstart',function(event){
            event = event.originalEvent || event;
            event.stopPropagation();

            // If someone is editing or dragging the element, pop a notification and prevent the story from being
            // dragged.
            var locked = scope.$eval(attr.dndDragLocked);
            if (locked === true) {
                notifications.currentlyEditing();
                return true;
            }

            var data = {
                logId: scope.$eval(attr.dndDragLog),
                list: scope.$eval(attr.dndDragCurrentList)
            };

            socket.lockLogEntry({_id: data.logId });

            if(element.attr('draggable') == 'false') { return true; }

            element.addClass("dragging");
            $timeout(function(){ element.addClass("draggingSource")},0);

            data = angular.toJson(data);
            event.dataTransfer.setData("Text",data);

        });
        /**
         * Processes what happens when the drag event ends. This will emit the "unlockLogEntry" socket message.
         */
        element.on('dragend',function(event){
            event = event.originalEvent || event;
            event.stopPropagation();
            var logId = scope.$eval(attr.dndDragLog);
            socket.unlockLogEntry({_id: logId});
            element.removeClass('dragging');
            $timeout(function(){ element.removeClass("draggingSource")},0);
        });

        /**
         * Determines what happens when the user drags another log into the drop zone for each log.
         */
        element.on('dragenter',function(event){
            event = event.originalEvent || event;
            event.preventDefault();
            element.addClass('dragover');
        });

        element.on('dragover',function(event){
            event = event.originalEvent || event;
            event.preventDefault();
        });

        element.on('dragleave',function(event){
            event = event.originalEvent || event;
            event.preventDefault();
            element.removeClass('dragover');
        });

        element.on('drop',function(event){

            event = event.originalEvent || event;
            event.preventDefault();
            element.removeClass('dragover');

            var transferredObject = event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain");
            try {
                var dragLog = JSON.parse(transferredObject);
                var dropList = scope.$eval(attr.dndDragCurrentList);
                var dropLogId = scope.$eval(attr.dndDragLog);

            } catch(e) {
                console.error('no dataTransfer, or could not parse dataTransfer');
                return true;
            }
            // Remove dragged log from old list.
            dragLog.list.logs = removeLogFromList(dragLog.list.logs,dragLog.logId);
            dropList.logs = removeLogFromList(dropList.logs,dragLog.logId);
            dropList.logs = insertLogIntoList(dropList.logs,dragLog.logId,dropLogId);

            // Only send the dropList to the server if dropping on existing list.
            var logs = (dragLog.list._id == dropList._id) ? [dropList] : [dragLog.list,dropList];



            deskLogs.updateLogOrder(JSON.stringify(logs));
        });

        function removeLogFromList(list,logId){
            var index = list.indexOf(logId);
            if(index != -1){
                list.splice(list.indexOf(logId),1);
            }
            return list;
        }

        function insertLogIntoList(list, dragLogId, dropLogId){
            list.splice(list.indexOf(dropLogId)+1,0,dragLogId);
            return list;
        }
    }
  }]);
