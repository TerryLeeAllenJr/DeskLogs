/**
 * modules/desklogs - This is the primary module for handling authentication in the system.
 * @type {*|exports}
 */
var redis = require('redis');
var q = require('q');
var mongoose = require('mongoose');
var db = require('../../database');
var Desks = db.desks;
var Lists = db.lists;
var Logs = db.logs;
var RepeatingLogs = db.repeatingLogs;
var bcrypt = require('bcrypt');

var history = require('../history');
var logger = require('../../logger');

/* Public API */
var DeskLogsModule = {
    createList: function (list) {
        return createList(list);
    },
    updateList: function (list) {
        return updateList(list);
    },
    getLists: function (date) {
        return getLists(date);
    },
    getPermanentLists: function(){
        return searchLists({permanent: true});
    },
    deleteList: function (_id) {
        return deleteList(_id);
    },
    getLogs: function (date) {
        return getLogs(date);
    },
    getAllLogs: function(){
        return searchLogs({});
    },
    getOrphanedLogs: function(){
        return getOrphanedLogs();
    },
    getRepeatingLogs: function(){
        return getRepeatingLogs();
    },
    createLog: function (log) {
        return createLog(log);
    },
    createRepeatingLog: function(log){
        return createRepeatingLog(log);
    },
    updateLog: function (log) {
        return updateLog(log);
    },
    updateRepeatingLog: function(log){
        return updateRepeatingLog(log);
    },
    deleteLog: function (_id) {
        return deleteLog(_id);
    },
    trashLog: function (_id) {
        return trashLog(_id);
    },
    trashRepeatingLog: function(_id){
        return trashRepeatingLog(_id);
    },
    restoreLog: function(data){
        return restoreLog(data);
    },
    updateLogOrder: function (logs) {
        return updateLogOrder(logs);
    },
    getDesks: function () {
        return getDesks();
    },
    moveLogToDesk: function (data) {
        return moveLogToDesk(data);
    },
    moveLogToList: function (data) {
        return moveLogToList(data);
    },
    updateApplication: function(){
        logger.debug('updateApplication API');
        return updateApplication(new Date());
    }
};

/* Application Updates */
/**
 * Publishes a message to the redis server.
 * @param channel
 * @param message
 */
function redisPublish(channel, message) {
    var publisher = redis.createClient();
    publisher.publish(channel, JSON.stringify(message));
}
/**
 * Updates all application data.
 * @returns {Promise.promise|*}
 */
function updateApplication(date) {
    var defer = q.defer();
    date = date || new Date();
    var data = {lists: {}, logs: {},date:date};
    getLists(date)
        .then(function (lists) {
            data.lists = lists;
            return getLogs(date);
        })
        .then(function (logs) {
            data.logs = logs;
            redisPublish('socket::broadcast', {msg: 'updateApplication', data: data});
            defer.resolve(data);
        })
        .catch(function (err) { defer.reject('DeskLogs.updateApplication(): ' + err); });
    return defer.promise;
}
/**
 * Updates the application list data only.
 * @returns {Promise.promise|*}
 */
function updateAppLists(date) {
    var defer = q.defer();
    date = date || new Date();
    getLists(date)
        .then(function (lists) {
            redisPublish('socket::broadcast', {msg: 'updateAppLists', data: {lists:lists, date:date}});
            defer.resolve({lists:lists, date:date});
        })
        .catch(function (err) { defer.reject('DeskLogs.updateAppLists(): ' + err); });
    return defer.promise;
}
/**
 * Updates only application log data.
 * @returns {Promise.promise|*}
 */
function updateAppLogs(date) {
    var defer = q.defer();
    date = date || new Date();
    getLogs(date)
        .then(function (logs) {
            redisPublish('socket::broadcast', {msg: 'updateAppLogs', data: {logs:logs,date:date}});
            defer.resolve({logs:logs,date:date});
        })
        .catch(function (err) { defer.reject('DeskLogs.updateAppLogs(): ' + err); });
    return defer.promise;
}

/* Lists */
/**
 * Get the list based on ID.
 * @param _id
 * @returns {Promise.promise|*}
 */
function getList(_id) {
    var defer = q.defer();
    Lists.findOne({_id: _id}, function (err, doc) {
        if (err) { defer.reject('DeskLogs.getList(): ' +err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Gets all lists from the Lists mongo collection.
 * @param date
 * @returns {Promise.promise|*}
 */
function getLists(date) {
    var defer = q.defer();
    date = date || new Date();
    var dates = getQueryDatesFromString(date);
    Lists.find({
        $or: [
            {createdAt: {$gte: dates.startingDate, $lte: dates.endDate}},
            {permanent: true},
            {defaultList: true}
        ]
    })
        .sort({
            defaultList: -1,
            permanent: -1,
            order: 1
        })
        .exec(function (err, lists) {
            if (err) { defer.reject('DeskLogs.getLists(): ' + err); }
            else { defer.resolve(lists); }
        });
    return defer.promise;
}
/**
 * Searches the Lists collection based on (object) query.
 * @param query
 * @returns {Promise.promise|*}
 */
function searchLists(query){
    var defer = q.defer();
    Lists.find(query,function(err,doc){
        if(err) { defer.reject('DeskLogsModule.searchLists(): ' + err); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Updates a list entry using a provided list object.
 * @param list
 * @returns {Promise.promise|*}
 */
function updateListEntry(list){
    var defer = q.defer();
    Lists.findOneAndUpdate({_id: list._id},list,{upsert: false, new: true}, function(err,doc){
        if(err) { defer.reject('DeskLogsModule.updateListEntry(): ' + err); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Creates a new list in the Lists collection.
 * @param data
 * @returns {Promise.promise|*}
 */
function createList(data) {
    var defer = q.defer();
    getListsByDesk(data.list.desk)
        .then(function (lists) { return updateOrderOnExistingLists(lists); })
        .then(function (doc) { return saveList(data.list); })
        .then(function (doc) { return updateAppLists(data.currentWorkingDate); })
        .then(function (doc) { return history.createEvent({type: 'createList', sso: data.sso, data: data.list}); })
        .then(function (doc) { defer.resolve(doc); })
        .catch(function (err) { defer.reject('DeskLogs.createList(): ' + err); });
    return defer.promise;
}
/**
 * Gets the list for a specific desk.
 * @param desk
 * @returns {Promise.promise|*}
 */
function getListsByDesk(desk) {
    var defer = q.defer();
    Lists.find({desk: desk}).sort({order: 1}).exec(function (err, lists) {
        if (err) { defer.reject('DeskLogs.getListsByDesk(): ' + err ); }
        else { defer.resolve(lists); }
    });
    return defer.promise;
}
/**
 * This loops through all current lists and increments the order on each. Used when creating a new list to add the list
 * to the top of the page.
 * @param lists
 * @returns {Promise.promise|*}
 */
function updateOrderOnExistingLists(lists) {
    var defer = q.defer();
    q.all(lists.map(function (thisList) { return incrementListOrder(thisList); }))
        .then(function(doc){ defer.resolve(doc); })
        .catch(function(err){ defer.reject('DeskLogsModule.updateOrderOnExistingLists(): ' + err); });
    return defer.promise;
}
/**
 * Increments a lists order by one. Used when adding a new list.
 * @param list
 * @returns {Promise.promise|*}
 */
function incrementListOrder(list){
    var defer = q.defer();
    list.order ++;
    Lists.findOneAndUpdate(
        {_id: list._id},
        list,
        {safe: true, upsert: false, new: true},
        function(err,doc){
            if(err) { defer.reject('DeskLogsModule.incrementListOrder(): ' + err); }
            else{ defer.resolve(doc); }
        });
    return defer.promise;
}
/**
 * Saves a new list to the collection with an order value of 1.
 * @param data
 * @returns {Promise.promise|*}
 */
function saveList(data) {
    var defer = q.defer();
    var list = new Lists(data);
    list.order = 1;
    list.updatedAt = new Date();
    list.save(function (err, doc) {
        if (err) { defer.reject('DeskLogs.saveList(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Updates a list in the Lists collection. Called when editing a list.
 * @param data
 * @returns {Promise.promise|*}
 */
function updateList(data) {
    var event = {type: 'editList', sso: data.sso, data: data.list};
    var defer = q.defer();
    data.list.logs = convertLogsToObjectIds(data.list.logs);
    Lists.findOneAndUpdate({_id: data.list._id}, data.list, function (err, doc) {
        if (err) { defer.reject('DeskLogsModule.updateLists(): ' + err); }

        updateAppLists(data.currentWorkingDate)
            .then(function (data) {
                return history.createEvent(event);
            })
            .then(function (data) {
                defer.resolve(data);
            })
            .catch(function (err) {
                defer.reject(err);
            });
    });
    return defer.promise;
}
/**
 * Deletes a list from the Lists collection using the _id.
 * @param data
 * @returns {Promise.promise|*}
 */
function deleteList(data) {
    var defer = q.defer();
    getList(data._id)
        .then(function (doc) {
            Lists.findOneAndRemove({_id: data._id}, function (err) {
                if (err) { defer.reject('DeskLogsModule.deleteList(): ' + err); }
                else {
                    updateAppLists()
                        .then(function (lists) { history.createEvent({type: 'deleteList', sso: data.sso, data: doc}) })
                        .then(function (lists) { defer.resolve(lists); })
                        .catch(function (err) { defer.reject('DeskLogsModule.deleteList(): ' + err); });
                }
            });
        })
        .catch(function (err) { defer.reject('DeskLogsModule.deleteList(): ' + err); });
    return defer.promise;
}
/**
 * Gets the default list for a specific desk.
 * @param deskTitle
 * @returns {Promise.promise|*}
 */
function getDefaultList(deskTitle) {
    var defer = q.defer();
    Lists.findOne({desk: deskTitle, defaultList: true}, function (err, doc) {
        if (err) { defer.reject('DeskLogs.getDefaultList(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

/* Logs */
/**
 * Gets logs based on a query.
 * @returns {Promise.promise|*}
 */
function searchLogs(query){
    var defer = q.defer();
    Logs.find(query)
        .sort({createdAt: -1})
        .exec(function (err, doc) {
            if (err) { defer.reject('DeskLogsModule.searchLogs(): ' + err); }
            else { defer.resolve(doc); }
        });
    return defer.promise;
}
/**
 * Gets all logs by date.
 * @param date
 * @returns {Promise.promise|*}
 */
function getLogs(date) {
    var defer = q.defer();
    date = date || new Date();
    var dates = getQueryDatesFromString(date);
    Logs.find({activeDate: {$gte: dates.startingDate, $lte: dates.endDate}}, function (err, logs) {
        if (err) { defer.reject('DeskLogs.getLogs(): ' + err); }
        else { defer.resolve(logs); }
    });
    return defer.promise;
}

function getRepeatingLogs(){
    var defer = q.defer();
    RepeatingLogs.find({}, function(err,doc){
        if(err) { defer.reject('DeskLogsModule.getRepeatingLogs(): ' + err); }
        else { defer.resolve(doc);}
    });
    return defer.promise;
}
/**
 * Gets a list of all logs not part of a list.
 * @returns {Promise.promise|*}
 */
function getOrphanedLogs(){
    var defer = q.defer();
    var lists,logs;
    searchLogs({})
        .then(function(doc){
            logs = doc;
            return searchLists({});
        })
        .then(function(doc){
            lists = doc;
            defer.resolve(calculateOrphans(lists,logs));
        })
        .catch(function(err){ defer.reject('DeskLogsModule.getOrphanedLogs(): ' + err); });
    return defer.promise;
}
/**
 * Determines which logs are not in any lists.
 * @param lists
 * @param logs
 * @returns {Array}
 */
function calculateOrphans(lists,logs){
    var orphans = [];
    logs.forEach(function(log,key){
        var found = false;
        lists.forEach(function(list){
            if(list.logs.indexOf(log._id) !== -1){ found = true; }
        });
        if(!found) { orphans.push(log); }
    });
    return orphans;
}
/**
 * Creates a new log entry.
 * @param data
 * @returns {Promise.promise|*}
 */
function createLog(data) {
    var defer = q.defer();
    var sso = data.sso,
        log;
    saveLog(data)
        .then(function (savedLog) {
            log = savedLog;
            return addLogToFrontOfList(data.selectedList, savedLog._id);
        })
        .then(function (result) {
            return updateApplication(data.currentWorkingDate);
        })
        .then(function () {
            return history.createEvent({type: 'createLog', sso: sso, data: log});
        })
        .then(function (data) {
            defer.resolve(data)
        })
        .catch(function (err) {
            defer.reject('DeskLogs.createLog(): ' + err);
        });
    return defer.promise;
}

function createRepeatingLog(log){
    var defer = q.defer();
    var repeatingLog = new RepeatingLogs(log);
    repeatingLog.updatedAt = new Date();
    repeatingLog.save(function(err,doc){
        if(err) { defer.reject('DeskLogsModule.createRepeatingLog(): ' + err);}
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Saves a log to the Logs collection.
 * @param data
 * @returns {Promise.promise|*}
 */
function saveLog(data) {
    var defer = q.defer();
    var log = new Logs(data.log);
    log.updatedAt = new Date();
    log.save(function (err, savedLog) {
        if (err) { defer.reject('DeskLogsModule.saveLog()' + err); }
        else { defer.resolve(savedLog); }
    });
    return defer.promise;
}
/**
 * Updates an existing log entry.
 * @param log
 * @returns {Promise.promise|*}
 */
function updateLog(log) {
    var defer = q.defer();
    var event = { type: 'updateLog', sso: log.sso, data: log.log};
    updateLogEntry(log.log)
        .then(function (savedLog) { return logIsInList(log.log._id, log.selectedList); })
        .then(function (isInList) {
            if (isInList) { return updateAppLogs(log.currentWorkingDate); }
            else {
                removeLogFromList(log.log._id)
                    .then(function (status) { return addLogToFrontOfList(log.selectedList, log.log._id); })
                    .then(function (added) { return updateApplication(log.currentWorkingDate); })
                    .then(function (data) { return history.createEvent(event); })
                    .then(function (data) { defer.resolve(data); })
                    .catch(function (err) { defer.reject('DeskLogs.updateLog(): ' + err); });
            }
        })
        .then(function (data) { return history.createEvent(event); })
        .then(function (data) { defer.resolve(data); })
        .catch(function (err) { defer.reject('DeskLogs.updateLog(): ' + err); });
    return defer.promise;
}

function updateRepeatingLog(log){
    var defer = q.defer();
    RepeatingLogs.findOneAndUpdate({ _id: log._id},log,{ upsert: false, new: true },function(err,doc){
        if(err) { defer.reject('DeskLogsModule.updateRepeatingLog(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Updates a logs timestamp.
 * @param log
 * @returns {Promise.promise|*}
 */
function updateLogTimestamp(_id) {
    var defer = q.defer();
    Logs.findByIdAndUpdate(
        _id,
        {updatedAt: new Date()},
        {safe: true, upsert: false, new: true},
        function (err, doc) {
            if (err) { defer.reject('DeskLogs.updateLogTimestamp(): ' + err); }
            else { defer.resolve(doc); }
        }
    );
    return defer.promise;
}
/**
 * Deletes a log based on _id.
 * @param _id
 * @returns {Promise.promise|*}
 */
function deleteLog(data) {
    var event = {type: "deleteLog", sso: data.sso, data: data._id};
    var defer = q.defer();
    removeLogFromList(data._id)
        .then(function (doc) { return updateApplication(data.date); })
        .then(function (data) { return history.createEvent(event); })
        .then(function (data) { defer.resolve(data); })
        .catch(function (err) { defer.reject('DeskLogs.deleteLog(): ' + err); });
    return defer.promise;
}
/**
 * Permanently deletes a log from the collection.
 * @param _id
 * @returns {Promise.promise|*}
 */
function trashLog(_id){
    var defer = q.defer();
    Logs.findOne({_id:_id}).remove(function(err,doc){
        if(err) { defer.reject('DeskLogsModule.trashLog(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

function trashRepeatingLog(_id){
    var defer = q.defer();
    RepeatingLogs.findOne({_id:_id}).remove(function(err,doc){
        if(err) { defer.reject('DeskLogsModule.trashRepeatingLog(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Restores a deleted log to the default desk/list.
 * @param data
 * @returns {Promise.promise|*}
 */
function restoreLog(data){
    var defer = q.defer();
    getDesks()
        .then(function(desks){
            return desks;
        })
        .then(function(desks){
            for (var key in desks) break;
            return getDefaultList(desks[key].title);
        })
        .then(function(list){
            return addLogToFrontOfList(list._id,data._id);
        })
        .then(function(doc){ return updateApplication(new Date());})
        .then(function(doc){ defer.resolve(doc);})
        .catch(function(err){ defer.reject('DeskLogs.restoreLog(): ' + err); });
    return defer.promise;
}
/**
 * Adds a batch of logs to the beginning of a list.
 * @param logs
 * @param list
 * @returns {Promise.promise|*}
 */
function addLogsToFrontOfList(logs, list) {
    var defer = q.defer();
    q.all(logs.map(function (log) { return addLogToFrontOfList(list._id, log); }))
        .then(function (doc) { defer.resolve(doc); })
        .catch(function (err) { defer.reject('DeskLogs.addLogsToFrontOfList(): ' + err); });
    return defer.promise;
}
/**
 * Adds a log to the beginning of a list.
 * @param listId
 * @param savedLog
 * @returns {Promise.promise|*}
 */
function addLogToFrontOfList(listId, newLogId) {
    var defer = q.defer();
    var updatedLog;
    logger.debug('adding log to front of list');
    logger.debug('getting lists logs');
    getListLogs(listId)
        .then(function(doc){
            logger.debug('updating list log entry');
            return updateListLogsEntry( listId, doc.logs, newLogId);
        })
        .then(function(doc){
            logger.debug('updating log timestamp');
            updatedLog = doc;
            return updateLogTimestamp(newLogId);
        })
        .then(function(doc){
            logger.debug('addLogtoFrontOfList() complete. resolving');
            defer.resolve(updatedLog);
        })
        .catch(function(err){
            logger.error('addLogToFrontOfList() failed...',err);
            defer.reject('DeskLogsModule.addLogToFrontOfList(): ' + err);
        });
    return defer.promise;
}
/**
 * Updates an existing log entry.
 * @param log
 * @returns {Promise.promise|*}
 */
function updateLogEntry(log) {
    var defer = q.defer();
    log.updatedAt = new Date();
    Logs.findOneAndUpdate({_id: log._id}, log, {upsert: false}, function (err, doc) {
        if (err) { defer.reject('DeskLogsModule.updateLogEntry(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Updates the logs entry of a List collection item. Using this to avoid List corruptions.
 * @param list
 * @param logs
 * @returns {Promise.promise|*}
 */
function updateListLogsEntry(listId,logs,newLogId){
    var defer = q.defer();
    logs.unshift(mongoose.Types.ObjectId(newLogId));

    /*
    Lists.collection.findAndModify(
        {_id: listId},
        [],
        {
            "$push": {
                "logs": {
                    "$each": [newLogId],
                    "$position": 0
                }
            }
        },
        { new :true },
        function(err,doc){
            if(err) { defer.reject('DeskLogsModule.updateListLogsEntry(): ' + err); }
            else{ defer.resolve(doc); }
        }
    );
    */
    Lists.findOneAndUpdate(
        {_id: listId},
        {logs: logs},
        {upsert:false, new:true},
        function(err,doc){
        if(err) { defer.reject('DeskLogsModule.updateListLogsEntry(): ' + err); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Gets the assigned logs from a list.
 * @param listId
 * @returns {Promise.promise|*}
 */
function getListLogs(listId){
    var defer = q.defer();
    Lists.findOne({_id:listId},'logs',function(err,doc){
        if(err) { defer.reject('DeskLogsModule.getListLogs(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Moves a log to a new list.
 * @param data
 * @returns {Promise.promise|*}
 */
function moveLogToList(data) {
    var defer = q.defer();
    removeLogFromList(data.log.logId)
        .then(function (doc) {
            return addLogToFrontOfList( data.list._id, data.log.logId );
        })
        .then(function (doc) {
            return updateApplication(data.currentDate);
        })
        .then(function () {
            return history.createEvent({type: 'assignLogToList', sso: data.sso, data: data});
        })
        .then(function () {
            defer.resolve(true);
        })
        .catch(function (err) {
            defer.reject('DeskLogsModule.moveLogToList: ' + err);
        });
    return defer.promise;
}
/**
 * Removes a log id from the list.logs entry.
 * @param logID
 * @returns {Promise.promise|*}
 */
function removeLogFromList(logID) {
    var defer = q.defer(),
        id = mongoose.Types.ObjectId(logID);
    Lists.update({}, {$pull: {logs: id}}, {multi: true}, function (err, doc) {
        if (err) { defer.reject('DeskLogsModule.removeLogFromList(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Determines if a log is in a specific list.
 * @param logID
 * @param listID
 * @returns {Promise.promise|*}
 */
function logIsInList(logID, listID) {
    var defer = q.defer();
    Lists.find({_id: listID}, 'logs', function (err, doc) {
        if (err) { defer.reject('DeskLogsModule.logIsInList(): ' + err); }
        var inList = (doc[0].logs.indexOf(logID) !== -1) || false;
        defer.resolve(inList);
    });
    return defer.promise;
}
/**
 * Updates the log order when a log is dropped into a new position in a list.
 * @param lists
 * @returns {Promise.promise|*}
 */
function updateLogOrder(lists) {
    var defer = q.defer();
    q.all(lists.map(function (thisList) {
        thisList.logs = convertLogsToObjectIds(thisList.logs);
        return updateListEntry(thisList);
    }))
        .then(function (doc) {
            return updateAppLists();
        })
        .then(function (data) {
            defer.resolve(data);
        })
        .catch(function (err) {
            defer.reject('DeskLogsModule.updateLogOrder(): ' + err);
        });
    return defer.promise;
}

/* Desks */
/**
 * Gets all desks.
 * @returns {Promise.promise|*}
 */
function getDesks() {
    var defer = q.defer();
    Desks.find({}, 'title', function (err, desks) {
        if (err) { defer.reject('DeskLogsModule.getDesks(): ' + err); }
        else{
            var result = {};
            for (var i in desks) { result[desks[i]._id] = desks[i]; } // Return an object referencing desks by _id.
            defer.resolve(result);
        }
    });
    return defer.promise;
}
/**
 * Removes a log from all desks befoew adding it to the default list in a new desk.
 * @param data
 * @returns {Promise.promise|*}
 */
function moveLogToDesk(data) {
    var defer = q.defer();
    removeLogFromList(data.log.logId)
        .then(function (doc) {
            return getDefaultList(data.desk.title);
        })
        .then(function (list) {
            return addLogToFrontOfList( list._id, data.log.logId );
        })
        .then(function (doc) {
            return updateAppLists();
        })
        .then(function () {
            return history.createEvent({type: 'assignLogToDesk', sso: data.sso});
        })
        .then(function (data) {
            defer.resolve(data);
        })
        .catch(function (err) {
            defer.reject('DeskLogsModule.moveLogToDesk(): ' + err);
        });
    return defer.promise;
}

/* Utilities */
/**
 * Creates a 0:0:0 and 23:59:59 starting and end time from a date string.
 * @param dateString
 * @returns {{startingDate: Date, endDate: Date}}
 */
function getQueryDatesFromString(dateString) {
    var startingDate =  new Date(dateString),
        endDate =       new Date(dateString);
    startingDate.setHours(0);
    startingDate.setMinutes(0);
    startingDate.setSeconds(0);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    return {startingDate: startingDate, endDate: endDate}
}
/**
 * Endures that each log in a list is the proper mongoose.Types.ObjectId type. This is used to ensure proper data
 * storage in Lists[_LIST_].logs.
 * @param logs
 * @returns {*}
 */
function convertLogsToObjectIds(logs) {
    logs.forEach(function (log, index) {
        logs[index] = mongoose.Types.ObjectId(log);
    });
    return logs;
}


function populateRepeatingLog(repeatingLog){
    var defer = q.defer();
    saveRepeatingLog(repeatingLog)
        .then(function(doc){
            return addLogToFrontOfList(repeatingLog.selectedList,doc._id);
        })
        .then(function(doc){ defer.resolve(doc); })
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}

function saveRepeatingLog(repeatingLog){
    var defer = q.defer();
    var log = new Logs({
        activeDate: new Date(),
        itemno: repeatingLog.itemno,
        slug: repeatingLog.slug,
        timeIn: repeatingLog.timeIn,
        timeOut: repeatingLog.timeOut,
        source: repeatingLog.source,
        contributionMethod: repeatingLog.contributionMethod,
        feed: repeatingLog.feed,
        format: repeatingLog.format,
        wr: repeatingLog.wr,
        txponder: repeatingLog.txponder,
        notes: repeatingLog.notes,
        rnc: repeatingLog.rnc,
        createdBy: '206452688',
        updatedBy: '206452688'
    });
    log.save(function(err,doc){
        if(err){ defer.reject(err); }
        else { defer.resolve({
            listId: repeatingLog.list,
            newLogId: doc._id
        }); }
    });
    return defer.promise;
}
module.exports = DeskLogsModule;