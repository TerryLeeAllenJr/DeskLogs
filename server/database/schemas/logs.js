/**
 Mongoose Schema for Logs
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var logs = new Schema({
        //type: {type: String, required: true},
        activeDate: {type: Date, required: true},
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
        updatedBy: {type: String, required: true},
        createdBy: {type: String, required: true}
    },
    {
        timestamps: true
    }
);


var Logs = mongoose.model('Logs', logs);

module.exports = Logs;