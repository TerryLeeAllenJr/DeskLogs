/**
 * modules/auth - This is the primary module for handling authentication in the system.
 * @type {*|exports}
 */


var redis = require('redis');
var q = require('q');
var request = require('request');
var logger = require('../../logger');

var MonitorModule = {
    getCurrentStatus: function(){ return getCurrentStatus(); }
};

function getCurrentStatus(){
    var defer = q.defer();

    defer.resolve({status:true,data:'bypassed'});
    return defer.promise;

    request('http://desklogs.nbcnewschannel.tv:9615/', function(err,res,body){
        if(err) {
            logger.error(err);
            defer.reject('MonitorModule.getCurrentStatus(): ' + err);
        }
        else { defer.resolve(JSON.parse(body)); }
    });
    return defer.promise;
}

module.exports = MonitorModule;