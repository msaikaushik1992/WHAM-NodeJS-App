// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema=mongoose.Schema({
    fname  :  { type: String, required: true},
    lname  :  { type: String, required: true},
    email  :  { type: String, required: true, unique: true},
    password : { type: String, required: true}
});

UserModel = mongoose.model('User',UserSchema);


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

