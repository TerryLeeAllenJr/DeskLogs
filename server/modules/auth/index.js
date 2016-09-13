/**
 * modules/auth - This is the primary module for handling authentication in the system.
 * @type {*|exports}
 */


/*
    TODO: Re-factor getUserData
    TODO: Trigger initValid users from intake cards server on update. (cURL to endpoint.)
    TODO: Clean up this mess.
    TODO: Fix logs drag and drop.
     */
//var express = require('express');
//var router = express.Router();
var moment = require('moment');
var _ = require('underscore');
var color = require('cli-color');
var redis = require('redis');
var q = require('q');
var db = require('../../database');
var Users = db.users;
var ValidUsers = db.validUsers;
var bcrypt = require('bcrypt');
var request = require('request');
var logger = require('../../logger');
var UserModule = require('../users');

var AuthModule = {
    createJSONWebToken: function(login) { return createJSONWebToken(login); },
    verifyJSONWebToken: function(jwt){ return verifyJSONWebToken(jwt);},
    createUser: function(user){ return createUser(user); },
    getUserData: function (sso) { return getUserData(sso); },
    updateUser: function(user){ return updateUser(user); },
    updatePreferences: function(user){ return updatePreferences(user); }
};

/**
 * Verifies a users login creds and creates a JWT. Returns {status: true, data:jwt}
 * @param login
 * @returns {Promise.promise|*}
 */
function createJSONWebToken(login){
    var defer = q.defer();
    performLogin(login)
        .then(function(res){
            if(!res.status){
                logger.error(res);
                defer.reject(res.data);
                return defer.promise;
            }
            else{return generateJSONWebToken(res.data);}
        })
        .then(function(jwt){ defer.resolve(jwt); })


        .catch(function(err){logger.error(err); defer.reject('AuthModule.createJSONWebToken(): ' + err); });
    return defer.promise;
}
/**
 * Verifies SSO and password. Returns {status: true, data: userData} if found, {status:false, data:[MESSAGE]} if not.
 * @param login
 * @returns {Promise.promise|*}
 */
function performLogin(login){
    var defer = q.defer();
    var userInfo;
    findUser(login.sso)
        .then(function(user){
            userInfo = user;
            if(!user){
                defer.resolve({status:false, data: 'This SSO was not found. Please sign-up for an account. '});
                return defer.promise;
            }
            else{ return verifyPassword(login.pw, user); }
        })
        .then(function(match){
            if(match) { defer.resolve({status: true, data: userInfo}); }
            else {
                defer.resolve({status: false, data: 'SSO and password do not match!'});
                return defer.promise;
            }
        })
        .catch(function(err){ defer.reject('AuthModule.login(): ' + err); });
    return defer.promise;
}
/**
 * Verifies the password using the mongoose helper defined in database/schemas/Users.
 * @param pw
 * @param doc
 * @returns {Promise.promise|*}
 */
function verifyPassword(pw,doc){
    var defer = q.defer();
    doc.comparePassword(pw, function(err,match){
        if(err) { defer.reject('AuthModule.verifyPassword(): ' + err); }
        else{ defer.resolve(match); }
    });
    return defer.promise;
}
/**
 * Generates a JSON Web Token and returns it as a string.
 * @param user
 * @returns {Promise.promise|*}
 */
function generateJSONWebToken(user){
    var defer = q.defer();
    // Create the JWT Key based on the client's sso to avoid collision.
    var key = 'jwt:' + user.sso,
        jwt;
    genSalt(10)
        .then(function(salt){ return genHash(user.sso,salt)})
        .then(function(hash){
            jwt = hash;
            return setToken(key,hash)
        })
        .then(function(hash){ return setTokenExpiration(key); })
        .then(function(){ defer.resolve(jwt); })
        .catch(function(err){ defer.reject('AuthModule.generateJSONWebToken(): ' + err); });
    return defer.promise;
}
/**
 * Generates a salt using bcrypt.
 * @param len
 * @returns {Promise.promise|*}
 */
function genSalt(len){
    var defer = q.defer();
    len = len || 10;
    bcrypt.genSalt(len,function(err,salt){
        if(err) { defer.reject('AuthModule.genSalt(): ' + err); }
        else{ defer.resolve(salt); }
    });
    return defer.promise;
}
/**
 * Generates a hash using bcrypt.
 * @param sso
 * @param salt
 * @returns {Promise.promise|*}
 */
function genHash(str, salt){
    var defer = q.defer();
    bcrypt.hash(String(str),salt,function(err,hash){
        if(err) { defer.reject('AuthModule.genHash(): ' + err); }
        else { defer.resolve(hash); }
    });
    return defer.promise;
}
/**
 * Connects to the redis client and returns a client instance.
 * @returns {Promise.promise|*}
 */
function createRedisClient(){
    var defer = q.defer();
    var client = redis.createClient();
    client.on('connect', function(err) {
        if(err) { defer.reject('AuthModule.createRedisClient(): ' + err); }
        else { defer.resolve(client); }
    });
    return defer.promise;
}
/**
 * Stores the JWT in Redis.
 * @param key
 * @param hash
 * @returns {Promise.promise|*}
 */
function setToken(key, hash){
    var defer = q.defer();
    var client = redis.createClient();
    client.on('connect', function(err) {
        if(err) {
            defer.reject('AuthModule.setToken(): ' + err);
            return defer.promise;
        }
    });
    client.set(key, hash, function (err) {
        if (err) { defer.reject('AuthModule.setToken(): ' + err); }
        else{ defer.resolve(hash); }
    });
    return defer.promise;
}
/**
 * Gets a JWT from redis based on key.
 * @param key
 * @returns {Promise.promise|*}
 */
function getToken(key){
    var defer = q.defer();
    createRedisClient()
        .then(function(client){
            client.get(key, function(err,res){
                if(err){ defer.reject('AuthModule.getToken(): ' + err ); }
                else{ defer.resolve(res); }
            });
        })
        .catch(function(err){ defer.reject(err); });
    return defer.promise;
}
/**
 * Sets the expiration of a JWT Key.
 * @param key
 * @returns {*}
 */
function setTokenExpiration(key){
    var defer = q.defer();
    var client = redis.createClient();
    client.on('connect', function(err) {
        if(err) {
            defer.reject('AuthModule.setTokenExpiration(): ' + err);
            return defer.promise;
        }
    });
    client.expire(key, 60 * 60 * 24 * 1, function (err,res) {
        if (err) { defer.reject(err); }
        else { defer.resolve(res); }
    });
    return defer.promise;
}
/**
 * Verifies that a JWT is valid in the system.
 * @param jwt
 * @returns {Promise.promise|*}
 */
function verifyJSONWebToken(jwt){
    var defer = q.defer();
    var key = 'jwt:' + jwt.sso;
    getToken(key)
        .then(function(key){
            var status = (key == jwt.token);
            defer.resolve(status);
        })
        .catch(function(err){ defer.reject('AuthModule.verifyJSONWebToken(): ' + err); });
    return defer.promise;
}

/**
 * Saves a user to the Users collection
 * @param user
 * @returns {Promise.promise|*}
 */
function createUser(user){
    var defer = q.defer();
    isUser(user.sso)
        .then(function(res){
            if(res.status){ defer.resolve({status:false, data:res.data}); }
            else{ return isValidUser(user.sso); }
        })
        .then(function(res){
            if(!res.status) {
                defer.resolve({status:false, data: res.data});
            }else{
                var newUser = {
                        sso: user.sso,
                        first: res.data.first,
                        last: res.data.last,
                        email: res.data.email,
                        phone: res.data.phone,
                        password: user.pw1
                    };
                return saveUser(newUser);
            }
        })
        .then(function(res){
            defer.resolve(res);
        })
        .catch(function(err){ defer.reject('AuthModule:createUser(): ' + err); });
    return defer.promise;
}

/**
 * Finds a user based on SSO.
 * @param sso
 * @returns {Promise.promise|*}
 */
function findUser(sso){
    var defer = q.defer();
    Users.findOne({sso: sso}, function(err,doc){
        if(err){ defer.reject('AuthModule.login(): ' + err); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}
/**
 * Gets a users info via sso.
 * @param sso
 * @returns {Promise.promise|*}
 */
function getUserData(sso){
    var defer = q.defer();
    Users.findOne({sso:sso}, function(err,doc){
        if(err){ defer.reject('AuthModule.getUser(): ' + err); }
        else {
            var response = (doc) ?
            {status: true, data: _.omit(doc.toJSON(),['password','__v'])} :
            {status: false, data: 'User not found...'};
            defer.resolve(response);
        }
    });
    return defer.promise;
}
/**
 * Checks the users SSO against the valid user list. Returns user object if true.
 * @param sso
 * @returns {Promise.promise|*}
 */
function isValidUser(sso){
    var defer = q.defer();
    ValidUsers.findOne({'sso': sso}, function (err, user) {
        if (err) { defer.reject('AuthModule.isValidUser(): ' + err); }
        var response = ( user ) ? {'status':true, 'data':user} : {'status':false, data:'Not a valid user.'};
        defer.resolve(response);
    });
    return defer.promise;
}
/**
 * Checks to see if the user is already in the system.
 * @param sso
 * @returns {Promise.promise|*}
 */
function isUser(sso){
    var defer = q.defer();
    Users.findOne({'sso': sso}, function (err, user) {
        if (err) { defer.reject('AuthModule.isUSer(): ' + err); }
        var response = (user) ?
        {'status': true, 'data': 'SSO already exists in DeskLogs system.'} :
        {'status': false}
        defer.resolve(response);
    });
    return defer.promise;
}
/**
 * Saves a new user to the database.
 * @param user
 * @returns {Promise.promise|*}
 */
function saveUser(user){
    var defer = q.defer();
    var newUser = new Users(user);
    newUser.save(function (err, doc) {
        if (err) { defer.reject('AuthModule.saveUser(): ' + err); }
        else{ defer.resolve({'status': true, 'data': doc}); }
    });
    return defer.promise;
}
/**
 * Updates an existing user with the provided password.
 * @param user
 * @returns {Promise.promise|*}
 */
function updateUser(user){
    var defer = q.defer();
    genSalt(10)
        .then(function(salt){return genHash(user.password,salt);})
        .then(function(hash){
            user.password = hash;
            Users.findOneAndUpdate({_id: user._id}, user, {new: true},function(err,doc){
                if(err){ defer.reject('AuthModule.updateUser(): ' + err );}
                else{ defer.resolve(doc); }
            });
        })
        .catch(function(err){ defer.reject('AuthModule.updateUser(): ' + err );});
    return defer.promise;
}
/**
 * Updates a users preferences.
 * @param user
 * @returns {Promise.promise|*}
 */
function updatePreferences(user){
    var defer = q.defer();
    Users.findOneAndUpdate(
        {_id: user._id},
        user,
        {new: true},
        function(err,doc){
            if(err) { defer.reject('AuthModule.updatePreferences(): ' + err);}
            else{ defer.resolve(doc); }
        }
    );
    return defer.promise;
}

module.exports = AuthModule;