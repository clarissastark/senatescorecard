var express = require("express");
var router = express.Router();
var hbs = require("express-handlebars");
var mongoose = require("./db/connection");
var parser = require("body-parser");
var passport = require("passport");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var request = require("request");
require("./config/passport")(passport);

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
app.use("/bower", express.static("bower-components"));
app.use(parser.urlencoded({extended: true}));

//Passport authorization – removes the "req.flash is not a function" error
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(session({ secret: "purpleschmurple", cookie: { secure: false } })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(function (req, res, next) {
  res.locals.isProduction = (process.env.NODE_ENV == "production");
  res.locals.currentUser = req.user;
  next();
});


app.get("/flash", function(req, res){
  req.flash("info", "Flash is back!")
  res.redirect("/senators");
});

app.get("/api/senators", function(req,res){
  Senator.find({}).then(function(senators){
    res.json(senators);
    });
  });

app.get("/api/senators/:lastName", function(req, res){
  Senator.findOne({lastName: req.params.lastName}).then(function(senator){
    res.json(senator);
  });
});

// adds a review of a senator to the db
app.post("api/senators/:lastName/reviews", function(req, res){
  Senator.findOne({lastName: req.params.lastName}).then(function(senator){
    senator.reviews.push(req.body.reviews);
    senator.save().then(function(senator){
      res.json(senator);
    });
  });
});

// deletes a review of a senator from the db
app.delete("/api/senators/:name/reviews/:index", function(req, res){
  Senator.findOne({lastName: req.params.name}).then(function(senator){
    senator.reviews.splice(req.params.index, 1);
    senator.save().then(function(senator){
      res.json(senator);
    });
  });
});

app.get("/signup", function(req, res) {
  res.render("signup", { message: req.flash("signupMessage") });
});

// process the signup form
app.post("/signup", passport.authenticate("local-signup", {
  successRedirect : "/",
  failureRedirect : "/signup",
  failureFlash : true
}));

app.get("/login", function(req, res){
  res.render("login", { message: req.flash("loginMessage") });
});

// process the login form
app.post("/login", function(req,res){
  var loginProperty = passport.authenticate("local-login", {
    successRedirect : "/",
    failureRedirect : "/login",
    failureFlash : true
  });
  return loginProperty(req, res);
});

app.get("/profile", isLoggedIn, function(req, res){
  res.render("profile", {
    user: req.user
  });
});


// stackoverflow Facebook login error solution code:
// app.post("/login", function(req,res, next){
//   passport.authenticate("local-login", {
//     successRedirect : "/",
//     failureRedirect : "/login",
//     failureFlash : true
//   }, function(err, user, info){
//     if (err) {
//     return next(err); // will generate a 500 error
//     }
//     // Generate a JSON response reflecting authentication status
//     if (! user) {
//     return res.send({ success : false, message : "authentication failed" });
// }
// return res.send({ success : true, message : "authentication succeeded" });
// })(req, res, next);
//   });
//
// });


// route for facebook authentication and login
app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email" }));

// handle the callback after facebook has authenticated the user
app.get("/auth/facebook/callback",
passport.authenticate("facebook", {
  successRedirect : "/profile",
  failureRedirect : "/"
})
);

// route for twitter authentication and login
app.get("/auth/twitter", passport.authenticate("twitter"));

// handle the callback after twitter has authenticated the user
app.get("/auth/twitter/callback",
passport.authenticate("twitter", {
  successRedirect : "/profile",
  failureRedirect : "/"
}));

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


// app.post("/senators/:lastName/reviews", function(req,res){
//   Senator.findOneAndUpdate({name: req.params.name}, req.body.senator.review, {new: true}).then(function(senator){
//     res.redirect("/senators/" + senator.lastName);
//   });
// });


app.get("/*", function(req, res){
  res.sendFile(__dirname + "/views/main.html");
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();
  res.redirect("/");
}

function authenticatedUser(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
