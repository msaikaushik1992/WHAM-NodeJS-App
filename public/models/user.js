// grab the things we need
var mongoose = require('mongoose');
var passport= require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Schema = mongoose.Schema;
var q = require('q');

var UserSchema=mongoose.Schema({
    fname  :  { type: String, required: true},
    lname  :  { type: String, required: true},
    email  :  { type: String, required: true, unique: true},
    password : { type: String}
});

UserModel = mongoose.model('User',UserSchema);


exports.FindUserByEmail = function (emailid)
{
    var deferred = q.defer();
    UserModel.findOne({ email: emailid }, function (err, user)
    {
        if(!err)
        {
            console.log(user);
            deferred.resolve(user);
        }
        else
        {
            console.log('error occured');
        }

    });
    return deferred.promise;
}


exports.updatePassword=function (req, res) {

    UserModel.findOne({_id: req.params.id}, function (err, user) {

        if (err) {
            console.log('error occured');
            res.send('error');

        }
        else {
            if (user == null || user == "") {
                console.log('No record found');
                res.send('empty');

            }
            else if (user.password == req.body.oldPassword) {
                user.password = req.body.newPassword;
                user.save(function (err) {
                    if (!err) {
                        console.log("updated Password");
                        res.send('success');
                    }
                    else {
                        console.log("Error Occured in Updating Password");
                        res.send('error');
                    }

                });
            }
            else {
                console.log("Error");
                res.send('error');
            }
        }
    });
}

exports.insertUser=function (req, res)
{

    var newUser = new UserModel(req.body);
    console.log(newUser);
    newUser.save(function(err)
    {

        if(err)
        {
            console.log("Error Occured");
            res.send('error');
        }
        else
        {
            res.send('success');
        }

    });
};


exports.createUser = function (user)
{
    var deferred = q.defer();
    var newUser = new UserModel(user);
    console.log(newUser);
    newUser.save(function(err)
    {

        if(err)
        {
            console.log("Error Occured");
            res.send('error');
        }
        else
        {
            UserModel.findOne({ email: user.email }, function (err, user)
            {
                if(!err)
                {
                    console.log(user);
                    deferred.resolve(user);
                }
                else
                {
                    console.log('error occured during auth');
                }

            });
        }

    });
    return deferred.promise;
}


exports.getUserInfo=function (req, res)
{


    UserModel.findOne({email:req.params.email},function(err,user)
    {

        if(err)
        {
            console.log('error occured');
            res.send('error');

        }
        else
        {
            if(user==null || user=="")
            {
                user=null
                res.send(null);
            }
            else
            {
                var userInfo = {id: user._id, fname: user.fname, lname: user.lname, email: user.email};
                res.send(userInfo);
            }
        }


    });

};


exports.login= function (req, res) {

    var user = req.user
    console.log(user);
    res.send(user);

};

exports.loggedin = function(req,res)
{
    res.send(req.isAuthenticated() ? req.user : '0');

};


passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){

    done(null,user);

});

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email,password,done){
        UserModel.findOne({email:email},function(err,user)
        {
            console.log('aunthenticating');
            if(err)
            {
                console.log('error occured');
                return done(null,false,{message:'Unable to Login'});
            }
            else if(user==null || user=="")
            {
                user=null
                return done(null,user);
            }
            else
            {
                console.log(user);
                if(password==user.password) {
                    var user={id:user._id,fname:user.fname,lname:user.lname,email:user.email};
                    return done(null, user);
                }
                else
                {
                    user=null
                    return done(null,'error');
                }
            }


        });

    }));




