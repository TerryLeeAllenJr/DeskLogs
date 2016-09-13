/**
 * modules/users - Utilities associated with users.
 * @type {exports}
 */
var redis = require('redis');
var q = require('q');
var mongoose = require('mongoose');
var db = require('../../database');
var Users = db.users;
var ValidUsers = db.validUsers;
var logger = require('../../logger');

var UsersModule = {
    findUsers: function(query){ return findUsers(query); },
    getUserFromSSO: function(sso) { return getUserFromSSO(sso); },
    getValidUsers: function(){ return getValidUsers(); },
    getOnlineUsers: function(){ return getOnlineUsers(); },
    addOnlineUser: function(sso) { return addOnlineUser(sso); },
    removeOnlineUser: function(sso) { return removeOnlineUser(sso); },
    isUserOnline: function(sso) { return isUserOnline(sso); },
    getOnlineUserCount: function() { return getOnlineUserCount(); }
};


/**
 * Gets a list of all current online users.
 * @returns {Promise.promise|*}
 */
function getOnlineUsers(){
    var defer = q.defer();
    var client = redis.createClient();
    client.smembers('online',function(err,res){
        if(err) { defer.reject('UsersModule.getOnlineUsers(): ' + err); }
        else{ defer.resolve(res); }
    });
    return defer.promise;
}

/**
 * Adds a user to the online pool.
 * @param sso
 * @returns {Promise.promise|*}
 */
function addOnlineUser(sso){
    var defer = q.defer();
    var client = redis.createClient();
    client.sadd('online',sso,function(err,res){
        if(err) { defer.reject('UsersModule.addONlineUser(): ' + err); }
        else { defer.resolve(res); }
    });
    return defer.promise;
}

/**
 * Removes a user from the online pool.
 * @param sso
 * @returns {Promise.promise|*}
 */
function removeOnlineUser(sso){
    var defer = q.defer();
    var client = redis.createClient();
    client.srem('online',sso,function(err,res){
        if(err) { defer.reject('UsersModule.removeOnlineUser(): ' + err); }
        else { defer.resolve(res); }
    });
    return defer.promise;
}

/**
 * Checks is user is online.
 * @param sso
 * @returns {Promise.promise|*}
 */
function isUserOnline(sso){
    var defer = q.defer();
    var client = redis.createClient();
    client.sismember('online',sso,function(err,res){
        if(err) { defer.reject('UsersModule.isUserOnline(): ' + err); }
        else { defer.resolve(res); }
    });
    return defer.promise;
}

/**
 * Gets the total number of online users.
 * @returns {Promise.promise|*}
 */
function getOnlineUserCount(){
    var defer = q.defer();
    var client = redis.createClient();
    client.scard('online',function(err,res){
        if(err) { defer.reject('UsersModule.getOnlineUserCount(): ' + err); }
        else { defer.resolve(res); }
    });
    return defer.promise;
}

/**
 * Gets users based on a query. If query is null, return all users.
 * @param query
 * @returns {Promise.promise|*}
 */
function findUsers(query){
    var defer = q.defer();
    query = query || {};
    Users.find(query,function(err,doc){
        if(err) {
            defer.reject('UsersModule.getUsers(): ' + err);
        }
        else {
            var users = (doc.length === 1) ? doc[0] : doc;
            defer.resolve(doc);
        }
    });
    return defer.promise;
}

/**
 * Gets all valid users based on a query. If no query is passed, all valid users are returned.
 * @param query
 * @returns {Promise.promise|*}
 */
function getValidUsers(query){
    var defer = q.defer();
    query = query || {};
    ValidUsers.find(query,function(err,doc){
        if(err) {
            logger.error('UsersModule.getValidUsers(): %s', err);
            defer.reject(err);
        }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Gets a users details based on SSO.
 * @param sso
 * @returns {Promise.promise|*}
 */
function getUserFromSSO(sso){
    var defer = q.defer();
    Users.findOne({sso: sso},function(err,doc){
        if(err) {
            logger.error('UsersModule.getUserFromSSO: %s', err);
            defer.reject(err);
        }
        else { defer.resolve(doc); }
    });
    return defer.promise;
}

module.exports = UsersModule;