var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;
var mongoose = require("../db/connection");
var User = require("../models/user");
var flash = require("connect-flash");
var configAuth = require("./auth.js");
var passport = require("passport");

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, callback) {
    User.findById(id, function(err, user) {
      callback(err, user);
    });
  });
  // for local signup
  passport.use("local-signup", new LocalStrategy({
    usernameField : "email",
    passwordField : "password",
    passReqToCallback : true
  }, function(req, email, password, callback) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // Find a user with this e-mail
      User.findOne({ "local.email" :  email }, function(err, user) {
        if (err) return callback(err);

        // If there already is a user with this email
        if (user) {
          return callback(null, false, req.flash("signupMessage", "This email is already used."));
        } else {
          // There is no email registered with this emai
          // Create a new user
          var newUser            = new User();
          newUser.local.email    = email;
          newUser.local.password = newUser.encrypt(password);

          newUser.save(function(err) {
            if (err) throw err;
            return callback(null, newUser);
          });
        }
      });
    });
  }));

  // for local login
  passport.use("local-login", new LocalStrategy({
    usernameField : "email",
    passwordField : "password",
    passReqToCallback : true
  }, function(req, email, password, callback) {

    User.findOne({ "local.email" :  email }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
      return callback(err);

      // if no user is found, return the message
      if (!user)
      return callback(null, false, req.flash("loginMessage", "No user found.")); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!user.validPassword(password))
      return callback(null, false, req.flash("loginMessage", "Oops! Wrong password.")); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return callback(null, user);
    });
  }));

  // for Facebook login
  passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL,
    enableProof     : true

  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, callback) {
    // asynchronous
    process.nextTick(function() {
      User.findOne({ "facebook.id" : profile.id }, function(err, user) {
        // if there is an error, stop everything and return that
        if (err)
        return callback(err);
        if (user) {
          return callback(null, user); // user found, return that user
        } else {
          // if there is no user found with that facebook id, create them
          var newUser = new User();
          // sets all of the facebook information in our user model
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName; // look at the passport user profile to see how names are returned
          newUser.facebook.email = profile.emails[0].value;
          newUser.save(function(err) {
            if (err)
            throw err;
            // if successful, return the new user
            return callback(null, newUser);
          });
        }
      });
    });
  }));

  passport.use(new TwitterStrategy({
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL

  },
  function(token, tokenSecret, profile, callback) {
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(function() {
      User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
        // if there is an error, stop everything and return that
        if (err)
        return callback(err);
        if (user) {
          return callback(null, user); // user found, return that user
        } else {
          var newUser                 = new User();
          newUser.twitter.id          = profile.id;
          newUser.twitter.token       = token;
          newUser.twitter.username    = profile.username;
          newUser.twitter.displayName = profile.displayName;
          newUser.save(function(err) {
            if (err)
            throw err;
            return callback(null, newUser);
          });
        }
      });
    });
  }));
};
