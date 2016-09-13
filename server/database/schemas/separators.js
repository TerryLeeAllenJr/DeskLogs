/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var separators = new Schema({
        type: {type: String, required: true},
        title: {type: String, required:true},
    },
    {
        timestamps: true
    }
);

var Separators = mongoose.model('Separators', separators);

module.exports = Separators;