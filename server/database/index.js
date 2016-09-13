
/**
 * Our Database Interface
 **/

var mongoose = require('mongoose');
var UserModel = require('./schemas/users');
var ValidUserModel = require('./schemas/validUsers');
var ListsModel = require('./schemas/lists');
var LogsModel = require('./schemas/logs');
var RepeatingLogsModel = require('./schemas/repeatingLogs');
var DesksModel = require('./schemas/desks');
var HistoryModel = require('./schemas/history');
var Feedback = require('./schemas/feedback');
var NotificationGroups = require('./schemas/notificationGroups');
var logger = require('../logger');

var usedDb = (process.env.NODE_ENV === 'production') ?
    'mongodb://localhost/desk_logs' :
    'mongodb://localhost/test';


mongoose.connect(usedDb);
var db = mongoose.connection;

db.on('error',console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    logger.debug('Database connection successfully opened at %s', usedDb);
});

exports.users = UserModel;
exports.validUsers = ValidUserModel;
exports.lists =ListsModel;
exports.logs = LogsModel;
exports.repeatingLogs = RepeatingLogsModel;
exports.desks = DesksModel;
exports.history = HistoryModel;
exports.feedback = Feedback;
exports.notificationGroups = NotificationGroups;
