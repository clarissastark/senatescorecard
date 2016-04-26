var mongoose = require("mongoose");
var passport = require("passport");
var bcrypt = require("bcrypt-nodejs");
require('../config/passport')(passport);

var UserSchema = mongoose.Schema({
    local : {
        email        : String,
        password     : String,
    },
    facebook : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

module.exports = mongoose.model("User", UserSchema);

// generating a hash
UserSchema.methods.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
