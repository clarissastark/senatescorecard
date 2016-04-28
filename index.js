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
var user = require("./models/user");

var app = express();

var Senator = mongoose.model("Senator");

app.set("port", process.env.PORT || 3001);

app.set("view engine", "html");
app.engine(".html", hbs({
  extname:        ".html",
  partialsDir:    "assets/html",
  layoutsDir:     "assets/html",
  defaultLayout:  "main"
}));

app.use("/assets", express.static("public"));
app.use("/bower", express.static("bower-components"));
app.use(parser.urlencoded({extended: true}));
app.use(parser.json({extended: true}));

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

// app.get("/api/senators", function(req, res){
//   Senator.find({}).lean().exec().then(function(senators){
//     senators.forEach(function(senator){
//       senator.isCurrentUser = (senator._id == req.session.senator_id);
//     });
//     res.json(senators);
//   });
// });

app.get("/api/senators", function(req,res){
  Senator.find({}).then(function(senators){
    res.json(senators);
  });
});

app.put("/api/senators", function(req,res){
  Senator.update(req.body.senator).then(function(senator){
    senator.save().then(function(senator){
      res.json(senator);
    });
  });
});

app.put("/api/senators/:name", function(req,res){
  Senator.findOneAndUpdate({lastName: req.params.name}, req.body.senator, {new: true}).then(function(senator){
    res.json(senator);
  });
});

app.post("/api/senators/:name", function(req, res){
  Senator.findOne({lastName: req.params.name}).then(function(senator){
    senator.save().then(function(senator){
      res.json(senator);
    });
  });
});

//======== EXPRESS USER SIGNUP/LOGIN ======//

// app.get("/", function(app,passport,req,res,next){
//   res.send("respond with a resource");
// });
//
// app.get("/signup", function(req, res) {
//   res.render("assets/html/signup.html", { message: req.flash("signupMessage") });
// });
//
// // process the signup form
// app.post("/signup", passport.authenticate("local-signup", {
//   successRedirect : "/",
//   failureRedirect : "/signup",
//   failureFlash : true
// }));
//
// // app.get("/login", function(req, res){
// //   res.render("assets/html/login", { message: req.flash("loginMessage") });
// // });
//
// // process the login form
// app.post("/login", function(req,res,next){
//   var loginProperty = passport.authenticate("local-login", {
//     successRedirect : "/",
//     failureRedirect : "/login",
//     failureFlash : true
//   });
//   return loginProperty(req, res, next);
// });
//
// app.get("/profile", isLoggedIn, function(req, res){
//   res.render("profile", {
//     user: req.user
//   });
// });
//
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


//======== ANGULAR USER SIGNUP/LOGIN  ======//

// app.get("/users", function(req, res, next) {
//   res.send("respond with a resource");
// });
//
// // route to test if the user is logged in or not
// app.get("/loggedIn", function(req, res, next) {
//   res.send(req.isAuthenticated() ? req.user : "0");
// });

app.post("/register", function(req, res) {
  User.register(new User({ username: req.body.username }),
  req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      });
    }
    passport.authenticate("local-login")(req, res, function () {
      return res.status(200).json({
        status: "Registration successful!"
      });
    });
  });
});

// route to log in
app.post("/login", function(req, res, next) {
  passport.authenticate("local-login", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: "Could not log in user"
        });
      }
      res.status(200).json({
        status: "Login successful!"
      });
    });
  })(req, res, next);
});

app.get("/logout", function(req, res) {
  req.logout();
  res.status(200).json({
    status: "Bye!"
  });
});

app.get("/status", function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});

// route to log out
// app.post("/logout", function(req, res, next){
//   req.logOut();
//   res.send(200);
// });

app.get("/*", function(req, res){
  res.sendFile(__dirname + "/views/main.html");
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    console.log("user logged in", req.user);
    return next();
  }else{
    res.redirect("/");
  }
}


function authenticatedUser(req, res, next) {
  if (req.isAuthenticated())
  return next();
  res.redirect("/");
}

app.listen(app.get("port"), function(){
  console.log("Ready to rock steady!");
});
