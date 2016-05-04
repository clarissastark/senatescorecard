var mongodb = require('mongodb');
var mongoose = require("./connection");
var seedData = require("./senators_seeds.json");
var uri = "mongodb://heroku_phhfprc2:q8om49jsukmpjkeg5f8ekp68u0@ds019481.mlab.com:19481/heroku_phhfprc2";

var Senator = mongoose.model("Senator");

mongodb.MongoClient.connect(uri, { server: { auto_reconnect: true } }, function (err, db) {
    console.log(err);
});

Senator.remove({}).then(function(){
  Senator.collection.insert(seedData).then(function(){
      process.exit();
  });
});
