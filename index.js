var express = require("express");
var hbs = require("express-handlebars");

var app = express();

app.get("/", function(req, res){
  res.send("Helloooo world");
});

app.listen(3001, function(){
  console.log("Ready to rock steady!");
});
