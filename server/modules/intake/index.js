/**
 * This module handles all of the low level connection points between this server and external sources
 * such as Intake Cards and VOD.
 * @type {*|exports}
 */

var request = require('request');
var q = require('q');
var db = require('../../database');
var ValidUsers = db.validUsers;
var logger = require('../../logger');

/**
 * The keychain of API keys needed for this module to function.
 * @type {{intakeCards: {url: string, token: string}}}
 */
var apiKeys = {
    intakeCards: {
        url: "http://54.152.12.63/intake/api.php",
        token: "1a0add9ea2ef11b60d2b2aff75259eea"
    }
};

/**
 * Public API.
 * @type {{initValidUsers: Function}}
 */
var IntakeModule = {
    initValidUsers: function () {
        var defer = q.defer();
        var validUserList;
        getValidUsersFromIntakeCards()
            .then(function (json) {
                validUserList = json;
                return clearValidUserList()
            }).then(function () {
                if (!validUserList) { defer.reject('No update valid user list found.'); }
                return updateValiduserList(validUserList);
            }).then(function () {
                defer.resolve({ status:true, data: "Successfully updated the valid user collection." });
            })
            .catch(function (err) {
                logger.error('IntakeModule.initValidUsers(): %s', err);
                defer.reject(err);
            });
        return defer.promise;
    }
};

/**
 * Hits the Intake Card API and retrieves a list of Valid Users from the database. This is ultimatley linked back to the
 * primary VOD nc_staff database, but is hitting the Intake Cards server to avoid bandwidth usage. This can be changed
 * out once the new VOD (Media Beach) application is up and running.
 * @returns {Promise.promise|*}
 */
function getValidUsersFromIntakeCards() {
    var defer = q.defer();
    request.post(
        {
            url: apiKeys.intakeCards.url,
            form: { token: apiKeys.intakeCards.token,  action: 'getUserList' }
        }, function (err, httpResponse, body) {
            if (err || !body || !httpResponse) { defer.reject( 'getValidUsersFromIntakeCards(): '+ err); }
            else{
                var json = JSON.parse(body);
                if (json.status != 200) { defer.reject('No response received from server.'); }
                defer.resolve(json);
            }
        });
    return defer.promise;
}
/**
 * Clears the ValidUser collection before updating.
 * @returns {Promise.promise|*}
 */
function clearValidUserList() {
    var defer = q.defer();
    ValidUsers.remove({}, function (err, removed) {
        if (err) { defer.reject('clearValidUserList(): ' + err); }
        defer.resolve(removed);
    });
    return defer.promise;
}
/**
 * Loops through the list of valid users returned from getValidUsersFromIntakeCards() and adds them to the collection.
 * @param json
 * @returns {Promise.promise|*}
 */
function updateValiduserList(json) {
    var defer = q.defer();
    var validUsers = json.data;
    q.all(validUsers.map(function(user){ return saveUser(user); }))
        .then(function(){ defer.resolve(true);})
        .catch(function(err) { defer.resolve('updateValidUserList(): ' +err); });
    return defer.promise;
}
/**
 * Saves a new user to the ValidUsers collection.
 * @param user
 * @returns {Promise.promise|*}
 */
function saveUser(user) {
    var defer = q.defer();
    var doc = new ValidUsers(user);
    doc.save(function(err, doc){
        if (err) { defer.reject('saveUser(): ' + err); }
        defer.resolve(doc);
    });
    return defer.promise;
}

module.exports = IntakeModule;