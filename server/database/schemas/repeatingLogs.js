/**
 Mongoose Schema for Logs
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var repeatingLogs = new Schema({
        desk: {type: String, required: true},
        list: {type: String, required: true},
        days: {type: Object},
        itemno: {type: String},
        slug: {type: String},
        timeIn: {type: String},
        timeOut: {type: String},
        source: {type: String},
        contributionMethod: {type: String},
        feed: {type: String},
        ready: {type: Boolean},
        format: {type: String},
        wr: {type: String},
        txponder: {type: String},
        notes: {type: String},
        rnc: {type: String},
        //updatedBy: {type: String, required: true},
        createdBy: {type: String, required: true}
    },
    {
        timestamps: true
    }
);


var RepeatingLogs = mongoose.model('RepeatingLogs', repeatingLogs);

module.exports = RepeatingLogs;