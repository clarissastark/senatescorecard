var mongoose = require("mongoose");
var passport = require("passport");
var User = require('../models/user');
require('../config/passport')(passport);

var SenatorSchema = new mongoose.Schema (
  {
    firstName: String,
    lastName: String,
    party: String,
    state: String,
    score2015: Number,
    scoreLifetime: Number,
    reviews: [String],
    "Por-environment votes": [String],
    "Anti-environment votes": [String],
    "Missed votes": [String]
  }
);

mongoose.model("Senator", SenatorSchema);

if(process.env.NODE_ENV == "production"){
  mongoose.connect(process.env.MONGODB_URI);
}else{
  mongoose.connect("mongodb://localhost/senatescore");
}

module.exports = mongoose;
