var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); //same as require("../middleware/index.js") because index.js is a special name

// INDEX ROUTE - Show all campgrounds
router.get("/", function(req, res){
	//Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, page: "campgrounds"});
		}
	});
});

// CREATE ROUTE - Add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form, and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	
	//Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			//redirect to campgrounds page if no error
			res.redirect("/campgrounds");
		}
	});
	
	//campgrounds.push(newCampground); //before DB, we just pushed to campgrounds array
});

// NEW ROUTE - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// SHOW ROUTE - Shows more info about one campground
router.get("/:id", function(req, res){
	//find campground with provided ID
	Campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground){
		if(err || !foundCampground){ //handles the posibility that foundCampground could be null
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.image = req.body.campground.image;
			campground.save(function(err){
				if(err){
					console.log(err);
					res.redirect("/campgrounds");
				} else {
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
});

// CAMPGROUND LIKE ROUTE
router.post("/:id/like", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			console.log(err);
			return res.redirect("/campgrounds");
		}
		
		// check if req.user._id exists in foundCampground.likes
		// the .some() method iterates over the foundCampground.likes array to see if the user already liked campground
		var foundUserLike = foundCampground.likes.some(function(like){
			return like.equals(req.user._id);
		});
		
		if (foundUserLike){
			// user already liked, so removing like
			foundCampground.likes.pull(req.user._id);
		} else {
			// add new like
			foundCampground.likes.push(req.user);
		}
		
		foundCampground.save(function(err){
			if(err){
				console.log(err);
				return res.redirect("/campgrounds");
			}
			return res.redirect("/campgrounds/" + foundCampground._id);
		});
	});
});

module.exports = router;