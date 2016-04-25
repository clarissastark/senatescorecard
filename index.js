var express = require("express");
var hbs = require("express-handlebars");
var mongoose = require("./db/connection");
var parser = require("body-parser");

var app = express();

var Senator = mongoose.model("Senator");
var UserReview = mongoose.model("UserReview");

app.set("port", process.env.PORT || 3001);
app.set("view engine", "hbs");

app.engine(".hbs", hbs({
  extname:      ".hbs",
  partialsDir:  "views/",
  layoutsDir:   "views/",
  defaultLayout: "layout-main"
})
);

app.use("/assets", express.static("public"));
app.use(parser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.render("welcome-page");
});

app.get("/senators", function(req,res){
  Senator.find({}).then(function(senators){
    res.render("senators-index", {
      senators: senators
    });
  });
});

app.get("/senators/:lastName", function(req, res){
  Senator.findOne({lastName: req.params.lastName}).then(function(senator){
    res.render("senators-show", {
      senator: senator
    });
  });
});

app.post("/senators/:lastName/reviews", function(req, res){
  Senator.findOne({lastName: req.params.lastName}).then(function(senator){
    senator.userReviews.push(req.body.userReview);
    senator.save().then(function(){
      res.redirect("/senators/" + senator.lastName);
    });
  });
});

app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
