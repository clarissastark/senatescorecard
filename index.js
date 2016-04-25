var express = require("express");
var hbs = require("express-handlebars");
var mongoose = require("./db/connection");

var app = express();

var Senator = mongoose.model("Senator");

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
  var desiredName = req.params.lastName;
  var senatorOutput;
  db.senators.forEach(function(senator){
    if(desiredName === senator.lastName){
      senatorOutput = senator;
    }
  });
  res.render("senators-show", {
    senator: senatorOutput
  });
});

app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
