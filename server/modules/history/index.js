/**
 * modules/desklogs - This is the primary module for handling authentication in the system.
 * @type {*|exports}
 */
var q = require('q');
var mongoose = require('mongoose');
var db = require('../../database');
var DeskLogs = db.deskLogs;
var Desks = db.desks;
var Lists = db.lists;
var Logs = db.logs;
var History = db.history;
var logger = require('../../logger');



/* Public API */
var HistoryModule = {
    createEvent: function(data) {
        var defer = q.defer();
        createEvent(data)
            .then(function(doc){ defer.resolve(doc); })
            .catch(function(err){
                logger.error('HistoryModule.createEvent() ',err);
            });
        return defer.promise;
    }
};

/**
 * Adds an event to the history collection. Used for statistical tracking.
 * @param data
 * @returns {Promise.promise|*}
 */
function createEvent(data){
    var defer = q.defer();
    var event = new History(data);
    event.save(function(err,doc){
        if(err) { defer.reject('HistoryModule.createEvent(): ' + err ); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Gets an event based on a query. If query is null all events are returned.
 * @param query
 * @returns {Promise.promise|*}
 */
function getEvent(query){
    var defer = q.defer();
    query = query || {};
    History.find(query,function(err,doc){
        if (err) { defer.reject('HistoryModule.getEvent(): ' + err); }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

module.exports = HistoryModule;