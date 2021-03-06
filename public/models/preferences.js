var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PreferencesSchema=mongoose.Schema({
    id  :  { type: String, required: true, unique: true},
    gender  :  { type: String, required: true},
    city  :  { type: String, required: true},
    categories : { type: Array}
});

PreferencesModel = mongoose.model('Preference',PreferencesSchema);



exports.updateCategories=function(req,res)
{
    var likedEventCategories = req.body.categories;
    PreferencesModel.findOne({id: req.body.userid}, function (err, pref) {

        if (err) {
            console.log('error occured');
            res.send('error');

        }
        else {
            if (pref == null || pref == "") {
                res.send('empty');
            }
            else {
                var preferences = pref.categories;
                var addedNew=false;
                var cat={};
                for(var i =0; i <preferences.length; i++)
                {
                    cat[preferences[i].category]=0;

                }
                console.log(cat);
                for(var i =0; i <likedEventCategories.length; i++)
                {
                    if(!cat.hasOwnProperty(likedEventCategories[i].id))
                    {
                        likedEventCategories[i].name=likedEventCategories[i].name.replace("&amp;" ,"/");
                        preferences.push({'category':likedEventCategories[i].id,'categoryText':likedEventCategories[i].name});
                    }

                }
                console.log(preferences);
                pref.categories=preferences;
                pref.save(function (err) {
                        if (!err) {
                            console.log("updated");
                            PreferencesModel.findOne({id: req.body.userid}, function (err, record) {
                                console.log(" Updated Record:" + record);
                                if (record == "" || record == null) {
                                    res.send('error');
                                }
                                else {

                                    res.send('success');
                                }

                            });
                        }
                    });

            }
        }


    });

}


exports.insertPreferences=function (req, res)
{

    var pref = new PreferencesModel(req.body);
    console.log(pref);
    pref.save(function(err)
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



exports.getUserPreferences=function (req, res)
{

    PreferencesModel.findOne({id: req.params.id}, function (err, pref) {

        if (err) {
            console.log('error occured');
            res.send('error');

        }
        else {
            if (pref == null || pref == "") {
                res.send('empty');
            }
            else {
                var preferences = pref.categories;
                res.send(preferences);
            }
        }


    });
}



exports.getUserProfile=function (req, res)
{

    PreferencesModel.findOne({id: req.params.id}, function (err, pref)
    {

        if (err) {
            console.log('error occured');
            res.send('error');

        }
        else {
            if (pref == null || pref == "") {
                res.send('empty');
            }
            else {
                var preferences = pref;
                res.send(preferences);
            }
        }


    });
}


exports.updateProfile=function (req, res)
{
    console.log(req.params.id);

    PreferencesModel.findOne({id: req.params.id}, function (err, pref)
    {

        if (err)
        {
            console.log('error occured');
            res.send('error');

        }
        else {
            if (pref == null || pref == "") {
                console.log('No record found');
                res.send('empty');

            }
            else
            {
                pref.gender=req.body.gender;
                pref.city=req.body.city;
                pref.categories=req.body.categories;
                pref.save(function (err)
                {
                    if (!err) {
                        console.log("updated");
                        PreferencesModel.findOne({id: req.params.id}, function (err, record) {
                            console.log(" Updated Record:" + record);
                            if (record == "" || record == null) {
                                res.send('error');
                            }
                            else
                            {

                                res.send('success');
                            }

                        });
                    }
                    else
                    {
                        res.send('error');
                    }
                });
            }
        }


    });
}



