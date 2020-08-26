var	express 		= require("express"),
	app 			= express(), 
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	flash			= require("connect-flash"),
	Campground 		= require("./models/campground"),
	Comment 		= require("./models/comment"),
	passport 		= require("passport"),
	LocalStrategy	= require("passport-local"),
	methodOverride	= require("method-override"),
	User			= require("./models/user"),
	seedDB			= require("./seeds");

// Requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index");

seedDB(); //seed database

mongoose.connect("mongodb+srv://firstuser:firstuserpassword@cluster0.fgio0.mongodb.net/<dbname>?retryWrites=true&w=majority", 
	{ 
		useNewUrlParser: true, 
		useUnifiedTopology: true,
		useCreateIndex: true
	}
).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(express.session({
	secret: "It's whatever.",
	resave: false,
	saveUninitialized: false,
	store: new (require("express-sessions"))({
        storage: 'mongodb',
    })
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// kind of like setting global/shared variables accross templates
	// e.g. currentUser, error are variables
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function(){
	console.log("YelpCamp Server has started");
});