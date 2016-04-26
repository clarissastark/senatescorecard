var express = require("express");
var hbs = require("express-handlebars");
var session = require("express-session");
var cmongo = require("connect-mongo");
var request = require("request");
var qstring = require("qs");
var mongoose = require("./db/connection");
var parser = require("body-parser");
var env = require("./env");

var app = express();
var SMongo = cmongo(session);

var Senator = mongoose.model("Senator");
var UserReview = mongoose.model("UserReview");

process.env.session_secret = env.session_secret;
process.env.t_callback_url = env.t_callback_url;
process.env.t_consumer_key = env.t_consumer_key;
process.env.t_consumer_secret = env.t_consumer_secret;

app.use(session({
  secret: process.env.session_secret,
  resave: false,
  saveUninitialized: false,
  store: new SMongo({
    mongooseConnection: mongoose.connection
  })
}));

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
  res.render("app-welcome");
});

app.get("/login/twitter", function(req, res){
  var url = "https://api.twitter.com/oauth/request_token";
  var oauth = {
    callback:         process.env.t_callback_url,
    consumer_key:     process.env.t_consumer_key,
    consumer_secret:  process.env.t_consumer_secret
  }
  request.post({url: url, oauth: oauth}, function(e, response){
    var auth_data = qstring.parse(response.body);
    var post_data = qstring.stringify({oauth_token: auth_data.oauth_token});
    req.session.t_oauth_token         = auth_data.oauth_token;
    req.session.t_oauth_token_secret  = auth_data.oauth_token_secret;
    res.redirect("https://api.twitter.com/oauth/authenticate?" + post_data);
  });
});

app.get("/login/twitter/callback", function(req, res){
  var url = "https://api.twitter.com/oauth/access_token";
  var auth_data = qstring.parse(req.query);
  var oauth = {
    consumer_key:     process.env.t_consumer_key,
    consumer_secret:  process.env.t_consumer_secret,
    token:            req.session.t_oauth_token,
    token_secret:     req.session.t_oauth_token_secret,
    verifier:         auth_data.oauth_verifier
  };
  // third leg of oauth authentication
  request.post({url: url, oauth: oauth}, function(e, response){
    var auth_data = qstring.parse(response.body);
    req.session.t_user_id = auth_data.user_id;
    req.session.t_screen_name = auth_data.screen_name;
    req.session.t_oauth = {
      consumer_key:     process.env.t_consumer_key,
      consumer_secret:  process.env.t_consumer_secret,
      token:            auth_data.oauth_token,
      token_secret:     auth_data.oauth_token_secret
    };
    request.get({
      url:           "https://api.twitter.com/1.1/useres/show.json",
      json:          true,
      oauth:         req.session.t_oauth,
      qs:            {
        screen_name: req.session.t_screen_name
      }
    }, function(e, response){
      res.json(response.body);
    });
  });
});

app.get("/apitest/:username", function(req, res){
  request.get({
    url:    "https://api.twitter.com/1.1/statuses/user_timeline.json",
    json:   true,
    oauth:  req.session.t_oauth,
    qs:     {
      screen_name: req.params.username,
      count: 2
    }
  }, function(e, response){
    res.json(response.body);
  });
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

// adds a review of a senator to the db
app.post("/senators/:lastName/reviews", function(req, res){
  Senator.findOne({lastName: req.params.lastName}).then(function(senator){
    senator.reviews.push(req.body.reviews);
    senator.save().then(function(){
      res.redirect("/senators/" + senator.lastName);
    });
  });
});

// app.post("/senators/:lastName/reviews", function(req,res){
//   Senator.findOneAndUpdate({name: req.params.name}, req.body.senator.review, {new: true}).then(function(senator){
//     res.redirect("/senators/" + senator.lastName);
//   });
// });

// deletes a review of a senator from the db
app.post("/senators/:name/reviews/:index", function(req, res){
  Senator.findOne({lastName: req.params.name}).then(function(senator){
    senator.reviews.splice(req.params.index, 1);
    senator.save().then(function(){
      res.redirect("/senators/" + senator.lastName);
    });
  });
});


app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
