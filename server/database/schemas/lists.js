/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema

var lists = new Schema({
        desk:       { type: String, required: true },
        title:      { type: String, required:true },
        order:      { type: Number, required:true },
        logs:       { type: Array },
        permanent:  { type: Boolean },
        defaultList:{ type: Boolean },
        rotating:   { type: Boolean }
    },
    {
        timestamps: true
    }
);

var Lists = mongoose.model('Lists', lists);

module.exports = Lists;