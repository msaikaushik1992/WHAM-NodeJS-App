var express = require('express')
var app = express();
var mongoose=require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var passport= require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logout = require('express-passport-logout');
var requestify = require('requestify');
var apicache = require('apicache').options({ debug: true }).middleware;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('./public/models/user');
var Preferences = require('./public/models/preferences');
var Event = require('./public/models/eventS');
var Rating = require('./public/models/eventrating');


// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded
app.use(session({secret:"this is the secret",saveUninitialized: true,resave:true}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());




app.post("/signup", User.insertUser);
app.get("/getUserInfo/:email", User.getUserInfo);
app.post("/preferences",Preferences.insertPreferences);
app.post("/login",passport.authenticate('local'), User.login);
app.get("/loggedin",User.loggedin);
app.get("/preferences/:id",Preferences.getUserPreferences);
app.get("/profileinfo/:id",Preferences.getUserProfile);
app.put("/updatePreferences/:id",Preferences.updateProfile);
app.put("/updatePassword/:id",User.updatePassword);
app.post("/addComment/:eventid", Event.insertComment);
app.get("/getEvent/:eventid", Event.getEvent);
app.post("/increaseLikeEvent/:eventid/:email", Event.increaseLikeCount);
app.post("/increaseDislikeEvent/:eventid/:email", Event.increasedisLikeCount);
app.delete("/deleteComment/:eventid/:commentid", Event.deleteComment);
app.post("/likeEvent", Rating.like);
app.post("/dislikeEvent", Rating.dislike);
app.put("/updateCategories", Preferences.updateCategories);
app.get("/getLikedEvents/:id", Rating.getLikedEvents);
app.get("/getDislikedEvents/:id", Rating.getDislikedEvents);
app.get("/getlikes/:eventid", Rating.getlikes);
app.delete("/unlike/:evid/:id", Rating.unlike);
app.get("/getdislikes/:eventid", Rating.getdislikes);
app.get("/checklike/:evid/:id", Rating.checkLike);
app.get("/getUserByEmail/:emailid",User.FindUserByEmail);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }), function (req, res) {

});

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/#/',
        failureRedirect: '/#/login'
    }),
    function (req, res) {
        res.json(user);
    });


passport.use(new FacebookStrategy({
    clientID: '795408297235627',
    clientSecret: 'e0f17bd9a78608e65cf29582897113f2',
    callbackURL:'http://localhost:8080/auth/facebook/callback',profileFields:["displayName","email"],
    enableProof: false
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        console.log(profile);
        var email = String(profile._json.email);
        console.log(email);
        User.FindUserByEmail(email).then(function (user) {
            if (user) {
                console.log(user);
                var userInfo = {id: user._id, fname: user.fname, lname: user.lname, email: user.email};
                return done(null, userInfo);
            } else
            {
                console.log('In Else');
                var fullname=profile._json.name.split(" ");
                var newUser =
                {
                    fname: fullname[0],
                    lname: fullname[1],
                    email: profile._json.email
                }
                console.log(newUser);
                User.createUser(newUser).then(function (user)
                {
                    var userInfo = {id: user._id, fname: user.fname, lname: user.lname, email: user.email};
                    return done(null, userInfo);
                });
            }
        });
    });
}));



app.post("/logout",function(req,res){

    req.logout();
    res.send(200);

});


locationObj={'lat':undefined,'long':undefined}


app.post("/location",function(req,res)
{
    location=req.body;
    locationObj.lat=location.lat;
    locationObj.long=location.long;
    res.send('sucess');
});


app.get("/getLocation", function(req,res)
{
    res.send(locationObj);
});



//Retrieves events close to the guest User
app.get("/eventsByLocation/:locationObj",apicache('15 minutes'),function(req,res)
{
   var locationObj=JSON.parse(req.params.locationObj);
   requestify.get('http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L&location='
       + locationObj.lat + "," + locationObj.long + '&date=Future&within=5&page_size=100&sort_order=popularity')
       .then(function(response)
   {

      if(response!==null)
      {
       res.send(response.body);
      }
      else
      {
       res.send('error');
      }


   });

});


//Retrieves events close to the user if the user is logged in and has set preferences

app.get("/eventsByLocationAndPreference/:locationPrefObj",apicache('15 minutes'),function(req,res)
{
    var locPrefObj=JSON.parse(req.params.locationPrefObj);
    requestify.get("http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L" +
        "&location="+locPrefObj.location.lat+","+ locPrefObj.location.long + "&date=Future&within=5&page_size=100" +
        "&category="+locPrefObj.categories +"&sort_order=popularity")
        .then(function(response)
        {

            if(response!==null)
            {
                res.send(response.body);
            }
            else
            {
                res.send('error');
            }
        });

});


//Retrieves events close to the user if the user is logged in and has set preferences and based on search term

app.get("/eventsByLocationAndQuery/:locationQueryObj",apicache('15 minutes'),function(req,res)
{
    var locQueryObj=JSON.parse(req.params.locationQueryObj);
    requestify.get("http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L" +
        "&location="+locQueryObj.location.lat+","+ locQueryObj.location.long + "&date=Future&within=5&page_size=100" +
        "&q="+locQueryObj.query+"&sort_order=popularity")
        .then(function(response)
        {
            if(response!==null)
            {
                res.send(response.body);
            }
            else
            {
                res.send('error');
            }
        });
});

app.get("/eventsByPreferenceAndQLocation/:prefQueLocObj",apicache('15 minutes'),function(req,res)
{
    var prefQLocationObj=JSON.parse(req.params.prefQueLocObj);
    requestify.get("http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L" +
        "&date=Future&within=5&page_size=100" +
        "&category="+prefQLocationObj.categories +
        "&location="+prefQLocationObj.location.lat+","+ prefQLocationObj.location.long +
        "&sort_order=popularity")
        .then(function(response)
        {
            if(response!==null)
            {
                res.send(response.body);
            }
            else
            {
                res.send('error');
            }
        });
});


app.get("/eventsByQLocation/:queLocationObj",apicache('15 minutes'),function(req,res)
{
    var queLocObj=JSON.parse(req.params.queLocationObj);
    requestify.get("http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L" +
        "&location="+queLocObj.location.lat+","+ queLocObj.location.long +"&date=Future&within=5&page_size=100" +
        "&sort_order=popularity")
        .then(function(response)
        {
            if(response!==null)
            {
                res.send(response.body);
            }
            else
            {
                res.send('error');
            }
        });
});

app.get("/eventsByQPreference/:quePrefObj",apicache('15 minutes'),function(req,res)
{
    var preObj=JSON.parse(req.params.quePrefObj);
    requestify.get("http://api.eventful.com/json/events/search?app_key=MTbVVjGdhvvx5r5L" +
        "&location="+preObj.location.lat+","+ preObj.location.long +
        "&category="+preObj.category +
        "&date=Future&within=5&page_size=100" +
        "&sort_order=popularity")
        .then(function(response)
        {
            if(response!==null)
            {
                res.send(response.body);
            }
            else
            {
                res.send('error');
            }
        });
});

app.get("/getLocationCoordsFromCity/:locObj", function(req, res){
    var queLoc=JSON.parse(req.params.locObj);
    requestify.get("https://maps.googleapis.com/maps/api/geocode/json?" + 
        "address="+queLoc.loc)
    .then(function(response)
    {
        if(response!==null)
        {
            res.send(response.body);
        }
        else
        {
            res.send('error');
        }

    });
});

var ip =  '127.0.0.1';
var port = 8080;


var server = app.listen(port,ip);
console.log('Server Started');

app.use(express.static(__dirname + "/public"));

var config = require('./_config');

// *** mongoose *** ///
mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
 if(err) {
  console.log('Error connecting to the database. ' + err);
 } else {
  console.log('Connected to Database: ' + config.mongoURI[app.settings.env]);
 }
});


/*
 }*/

module.exports = app;
