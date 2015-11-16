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


var User = require('./public/models/user');
var Preferences = require('./public/models/preferences');



// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded
app.use(session({secret:"this is the secret",saveUninitialized: true,resave:true}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());



var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Wam';

mongoose.connect(connectionString);



app.post("/signup", User.insertUser);
app.get("/getUserInfo/:email", User.getUserInfo);
app.post("/preferences",Preferences.insertPreferences);
app.post("/login",passport.authenticate('local'), User.login);
app.get("/loggedin",User.loggedin);
app.get("/preferences/:id",Preferences.getUserPreferences);


app.get("/logout",function(req,res){

 req.logout();
 res.send(200);


});


/*app.get('/process',function(req,res){

 res.json(process.env);

 });*/

var ip =  '127.0.0.1';
var port = 8080;


var server = app.listen(port,ip);
console.log('Server Started');

app.use(express.static(__dirname + "/public"));