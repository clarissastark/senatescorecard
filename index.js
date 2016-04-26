var express = require("express");
var router = express.Router();
var hbs = require("express-handlebars");
var mongoose = require("./db/connection");
var parser = require("body-parser");
var passport = require("passport");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
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
app.use(parser.urlencoded({extended: true}));

//Passport authorization – removes the "req.flash is not a function" error
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(session({ secret: "purpleschmurple" })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", function(req, res){
  res.render("welcome-page");
});

app.get("/flash", function(req, res){
  req.flash("info", "Flash is back!")
  res.redirect("/senators");
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
    senator.reviews.push(req.body.reviews);
    senator.save().then(function(){
      res.redirect("/senators/" + senator.lastName);
    });
  });
});

app.get("/signup", function(req, res) {
  res.render("signup", { message: req.flash("signupMessage") });
});

// process the signup form
app.post("/signup", passport.authenticate("local-signup", {
  successRedirect : "/profile", // redirect to the secure profile section
  failureRedirect : "/signup", // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

// app.post("/signup", function(req, res){
//   var signupStrategy = passport.authenticate("local-signup", {
//     successRedirect : "/",
//     failureRedirect : "/signup",
//     failureFlash : true
//   });
//   return signupStrategy(req, res);
// });

app.get("/login", function(req, res){
  res.render("login", { message: req.flash("loginMessage") });
});

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

// route middleware to make sure user is logged in

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

// app.post("/senators/:lastName/reviews", function(req,res){
//   Senator.findOneAndUpdate({name: req.params.name}, req.body.senator.review, {new: true}).then(function(senator){
//     res.redirect("/senators/" + senator.lastName);
//   });
// });

app.post("/senators/:name/reviews/:index", function(req, res){
  Senator.findOne({lastName: req.params.name}).then(function(senator){
    senator.reviews.splice(req.params.index, 1);
    senator.save().then(function(){
      res.redirect("/senators/" + senator.lastName);
    });
  });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
