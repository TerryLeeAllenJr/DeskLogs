var q = require('q');
var aws = require('aws-sdk');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-smtp-transport');
var config = require('../../config/aws.json');
var logger = require('../../logger');

var MailModule = {
    createAndSend: function(email){
        var defer = q.defer();
        createAndSend(email)
            .then(function(data){
                defer.resolve(data);
            })
            .catch(function(err) {
               logger.error('MailModule.createAndSend(): %s', err);
            });
        return defer.promise;
    }
};

/**
 * Formats an email properly and sends via the SES transport.
 * @param email
 * @returns {Promise.promise|*}
 */
function createAndSend(email){
    var defer = q.defer();
    createEmail(email)
        .then(function(mailOptions){ return sendMail(mailOptions); })
        .then(function(info){ defer.resolve(info);})
        .catch(function(err) { defer.reject(err); })
    return defer.promise;
}

/**
 * Creates a valid mailOptions object from an email object passed into the module.
 * @param email
 * @returns {Promise.promise|*}
 */
function createEmail(email){
    var defer = q.defer();

    // Test to ensure that the email object exists.
    if(!email){
        defer.reject('Mail.createEmail():: You must provide an email object.');
        return defer.promise;
    }

    // Test to ensure that all proper fields are available before sending.
    if( !email.hasOwnProperty('to') ){
        defer.reject('Mail.createEmail(): You must specify a valid recipient.');
        return defer.promise;
    }

    // Test to ensure that the email object has ether a text or html body.
    if( !email.hasOwnProperty('text') && !email.hasOwnProperty('html') ) {
        defer.reject('Mail.sendEmail(): No valid email body entered. Please specify either text: or html: ' +
        'in the email object.');
        return defer.promise;
    }

    // Format the email.
    var mailOptions = {};
    mailOptions.Source = email.from || 'noreply@desklogs.nbcnewschannel.tv';
    mailOptions.Destination = { ToAddresses: email.to};
    mailOptions.Message = {};
    mailOptions.Message.Subject = {};
    mailOptions.Message.Subject.Data = email.subject || 'Desklogs AutoMailer: Generic Email';
    mailOptions.Message.Body = {};
    if(email.text){
        mailOptions.Message.Body.Text = {};
        mailOptions.Message.Body.Text.Data = email.text;
    }
    if(email.html){
        mailOptions.Message.Body.Html = {};
        mailOptions.Message.Body.Html.Data = email.html;
    }
    defer.resolve(mailOptions);
    return defer.promise;
}

/**
 * Sends an email. Requires a pre-configured mailOptions vairalble that follows the SES SDK formatting.
 * @param mailOptions
 * @returns {Promise.promise|*}
 */
function sendMail(mailOptions){
    var defer = q.defer();
    // Create transport.
    var aws = require('aws-sdk');
    aws.config.loadFromPath('./config/aws.json');
    var ses = new aws.SES({apiVersion: '2010-12-01'});
    ses.sendEmail(mailOptions,function(err,data){
        if(err) { defer.reject('Mail.sendMail() ERROR: ' + err); }
        else{ defer.resolve(data); }
    });
    return defer.promise;
}


module.exports = MailModule;