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
	seedDB			= require("./seeds"),
	session 		= require("express-session");

// Requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index");

seedDB(); //seed database

const url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
console.log(process.env.DATABASEURL); 

mongoose.connect(url,
	{ 
		useMongoClient: true, 
		useNewUrlParser: true, 
		useUnifiedTopology: true,
		useCreateIndex: true
	}
).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://firstuser:firstuserpassword@cluster0.fgio0.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


// const { MongoClient } = require("mongodb");
 
// // Replace the following with your Atlas connection string                                                                                                                                        

// const url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
// console.log(process.env.DATABASEURL);

// const client = new MongoClient(url, {useUnifiedTopology: true});

// async function run() {
//     try {
//         await client.connect();
//         console.log("Connected correctly to server");

//     } catch (err) {
//         console.log(err.stack);
//     }
//     finally {
//         await client.close();
//     }
// }

// run().catch(console.dir);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(session({
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

app.listen(process.env.PORT, function(){
	console.log("YelpCamp Server has started");
});