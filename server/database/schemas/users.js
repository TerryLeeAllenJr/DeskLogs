/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var userSchema = new Schema({
    sso: { type: Number, required: true, unique: true },
    first: { type: String, required: true },
    last: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String},
    permissions: { type: Array},
    preferences: { type: Object }
});

// A method that's called every time a user document if saved...
userSchema.pre('save', function(next){

    var user = this;

    // If the password hasn't been modified, move along...
    if(!user.isModified('password')){ return next(); }

    // generate salt
    bcrypt.genSalt(10, function(err, salt){
        if (err) return next(err);

        // create hash and store it
        bcrypt.hash(user.password, salt, function(err, hash){
            if (err) return next(err);
            user.password = hash;
            next();
        });

    });

});

// Password verification helper
userSchema.methods.comparePassword = function( triedPassword, cb ){
    bcrypt.compare(triedPassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

module.exports = User;