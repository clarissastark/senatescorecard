var mongoose = require("./connection");
var seedData = require("./senators_seeds.json");

var UserReview = mongoose.model("UserReview");

var Senator = mongoose.model("Candidate");

Senator.remove({}).then(function(){
  Senator.collection.insert(seedData).then(function(){
      process.exit();
  });
});
