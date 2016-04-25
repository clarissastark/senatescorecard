var mongoose = require("mongoose");

var UserReviewSchema = new mongoose.Schema (
  {
    author: String,
    senator: String,
    body: String,
    date: Date
  }
);

var SenatorSchema = new mongoose.Schema (
  {
    firstName: String,
    lastName: String,
    party: String,
    state: String
  }
);

mongoose.model("Senator", SenatorSchema);
mongoose.model("UserReview", UserReviewSchema);

if(process.env.NODE_ENV == "production"){
  mongoose.connect(process.env.MONGODB_URI);
}else{
  mongoose.connect("mongodb://localhost/senatescore");
}

module.exports = mongoose;
