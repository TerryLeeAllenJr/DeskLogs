/**
 * modules/desklogs - This is the primary module for handling authentication in the system.
 * @type {*|exports}
 */
var q = require('q');
var mongoose = require('mongoose');
var db = require('../../database');
var Users = db.users;
var logger = require('../../logger');
var redis = require('redis');

/* Public API */
var NotificationsModule = {
    sendGlobalNotification: function(notification) { return sendGlobalNotification(notification); }
};


function sendGlobalNotification(notification){
    var defer = q.defer();
    try{
        var publisher = redis.createClient();
        publisher.publish('socket::broadcast', JSON.stringify({
            msg: 'notification',
            data: notification
        }));
        defer.resolve({status:true});
    }catch($e){
        defer.reject('NotificationModule.sendGlobalNotification(): ' + $e);
    }
    return defer.promise;
}



module.exports = NotificationsModule;