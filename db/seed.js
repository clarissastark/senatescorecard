var mongoose = require("./connection");
var seedData = require("./senators_seeds.json");

var UserReview = mongoose.model("UserReview");

var Senator = mongoose.model("Senator");

Senator.remove({}).then(function(){
  Senator.collection.insert(seedData).then(function(){
      process.exit();
  });
});

UserReview.remove({}).then(function(){
  UserReview.collection.insert(seedReviews).then(function(){
      process.exit();
  });
});
