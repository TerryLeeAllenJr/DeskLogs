var q = require('q');
var mongoose = require('mongoose');
var db = require('../../database');
var Feedback = db.feedback;
var users = require('../users');
var mail = require('../mail');
var history = require('../history');
var config = require('../../config/config.json');
var logger = require('../../logger');

/**
 * Allows users to create and view feedback tickets.
 * @type {{createFeedback: Function, getFeedback: Function}}
 */
var FeedbackModule = {
    createFeedback: function(feedback){
        var defer = q.defer();
        createFeedback(feedback)
            .then(function(status){ defer.resolve(status); })
            .catch(function(err){
                logger.error('FeedbackModule.createFeedback(): ', err);
                defer.reject(err);
            });
        return defer.promise;
    },
    getFeedback: function(query){
        var defer = q.defer();
        getFeedback(query)
            .then(function(doc){ defer.resolve(doc); })
            .catch(function(err){
                logger.error('FeedbackModule.getFeedback: ',err);
                defer.reject(err);
            });
        return defer.promise;
    }
};

/**
 * Creates the feedback object, sends an email, then logs the creation in history.
 * @param feedback
 * @returns {Promise.promise|*}
 */
function createFeedback(feedback){
    var defer = q.defer();
    saveFeedback(feedback)
        .then(function(doc){ return sendEmail(doc); })
        .then(function(){
            return history.createEvent({
                type: 'sendFeedback',
                sso: feedback.user,
                data: feedback
            });
        })
        .then(function(){ defer.resolve({status: true, data: feedback}); })
        .catch(function(err){ defer.reject('FeedbackModule.createFeedback:: ' + err); });
    return defer.promise;
}

/**
 * Save a feedback response to the collection.
 * @param feedback
 * @returns {Promise.promise|*}
 */
function saveFeedback(feedback){
    var defer = q.defer();
    var entry = new Feedback(feedback);
    entry.phase = 'pending';
    entry.save(function(err,doc){
        if(err) { defer.reject('FeedbackModule.saveFeedback(): ' + err ); }
        else{ defer.resolve(doc); }
    });
    return defer.promise;
}

/**
 * Gets feedback based on a query. If no query is provided, all feedback is returned.
 * @param query
 * @returns {Promise.promise|*}
 */
function getFeedback(query){
    var defer = q.defer();
    query = query || {};
    Feedback.find(query,function(err,doc){
        if(err){ defer.reject( {status:false, msg: "FeedbackModule.getFeedback(): " + err}); }
        else { defer.resolve( {status:true, data:doc} ); }
    });
    return defer.promise;
}

/**
 * Sends an email to the originating user, the developer, and the IT email desk.
 * @param feedback
 * @returns {Promise.promise|*}
 */
function sendEmail(feedback){
    var defer = q.defer();
    users.getUserFromSSO(feedback.user)
        .then(function(user){
            var email = {
                to: [user.email, config.developer.email, config.itDesk.email],
                subject: 'User Feedback ('+ feedback.type+'): ' + feedback.subject,
                html: feedback.text
            };
            return mail.createAndSend(email);
        })
        .then(function(){ defer.resolve(feedback); })
        .catch(function(err){ defer.reject('FeedbackModule.sendEmail::' + err); });
    return defer.promise;
}

module.exports = FeedbackModule;