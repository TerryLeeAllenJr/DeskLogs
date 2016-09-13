/**
 Mongoose Schema for Application History
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var history = new Schema({
        sso: { type: String },
        type: { type: String },
        data: { type: Object }
    },
    { timestamps: true }
);
var History = mongoose.model('History', history);
module.exports = History;