/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var desks = new Schema({
        title: {type: String, required:true}
    }
);

var Desks = mongoose.model('Desks', desks);

module.exports = Desks;