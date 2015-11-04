var express = require('express')
var app = express();
var mongoose=require('mongoose');
/*var bodyParser = require('body-parser');
var multer = require('multer');
var passport= require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');*/



/*app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret'}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());*/


/*var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/MarvelDB';

mongoose.connect(connectionString);

var UserSchema=mongoose.Schema({
 fname  :  String,
 lname  :  String,
 email  :  String,
 password :  String
});

var UserModel = mongoose.model('UserModel',UserSchema);

var user = new UserModel({fname:'Donkey',lname:'Monkey',email:'ddaa@gmail.com',password:'Adasda88'})

user.save();*/

/*app.get('/process',function(req,res){

 res.json(process.env);

 });*/

var ip =  '127.0.0.1';
var port = 8080;


var server = app.listen(port,ip);
console.log('Server Started');

app.use(express.static(__dirname + "/public"));