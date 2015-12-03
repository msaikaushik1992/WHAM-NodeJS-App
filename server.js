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


var User = require('./public/models/user');
var Preferences = require('./public/models/preferences');
var Event = require('./public/models/eventS');



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


app.get("/logout",function(req,res)
{

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
app.get("/eventsByLocation/:locationObj",apicache('5 minutes'),function(req,res)
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

app.get("/eventsByLocationAndPreference/:locationPrefObj",apicache('5 minutes'),function(req,res)
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
