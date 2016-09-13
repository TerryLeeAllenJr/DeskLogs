/**
 Mongoose Schema for Users
 **/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// Define the User Schema
var validUserSchema = new Schema({
    first: { type: String },
    last: { type: String },
    email: { type: String  },
    phone: { type: String },
    sso: {type: Number }
});

// A method that's called every time a user document if saved...
/*userSchema.pre('save', function(next){

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
*/
var ValidUser = mongoose.model('ValidUser', validUserSchema);

module.exports = ValidUser;