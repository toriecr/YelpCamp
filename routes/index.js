var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/", async function(req, res){
	res.render("landing");
});

//======================
// AUTH ROUTES
//======================

// show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

// handle sign up logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"}); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
	//middleware callback doesn't do anything
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You are now logged out.");
	res.redirect("/campgrounds");
});

module.exports = router;