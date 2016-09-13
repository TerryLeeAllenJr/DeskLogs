/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var groups = new Schema({
        title: {type: String, required:true},
        users: {type: Array }
    }
);

var Groups = mongoose.model('NotificationGroups', groups);

module.exports = Groups;