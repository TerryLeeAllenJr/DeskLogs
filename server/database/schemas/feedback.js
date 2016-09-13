/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var feedback = new Schema({
        user: {type: String, required:true},
        type: {type: String },
        subject: {type: String },
        text: { type: String}
    },
    {
        timestamps: true
    }
);

var Feedback = mongoose.model('Feedback', feedback);

module.exports = Feedback;