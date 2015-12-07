/**
 * Created by toshiba on 12/4/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatingSchema=mongoose.Schema({
    userid  :  { type: String, required: true},
    eventid  :  { type: String, required: true},
    categories : { type: Array, required: true},
    type:{ type: String, required: true},
    title:{type:String},
    img:{type:String,},
    lat:{type:String,},
    lon:{type:String,}
});

RatingModel = mongoose.model('Rating',RatingSchema);




exports.getLikedEvents=function (req, res)
{

    RatingModel.find({ userid:req.params.id,type:'like' }, function (err, doc)
    {
        var rating = new RatingModel(req.body);
        if (err)
        {
            res.send('error');

        }
        else
        {
           if(!doc)
           {
               res.send('null');
           }
            else
           {
               res.send(doc);
           }
        }


    });
};


exports.getDislikedEvents=function (req, res)
{

    RatingModel.find({ userid:req.params.id,type:'dislike' }, function (err, doc)
    {
        var rating = new RatingModel(req.body);
        if (err)
        {
            res.send('null');

        }
        else
        {
            if(!doc)
            {
                res.send('null');
            }
            else
            {
                var blacklist={ };
                for(var i=0;i<doc.length;i++)
                {
                    blacklist[doc[i].eventid]=1;
                }
                res.send(blacklist);
            }
        }


    });
};



exports.getlikes=function(req,res)
{
    RatingModel.find({eventid:req.params.eventid, type:'like'}, function (err, doc)
    {
        if(!err)
        {
            if (!doc) {

                res.send('0');

            }
            else {
                res.send('' + doc.length);
            }
        }
        else
        {
            res.send('error');
        }

    });

}

exports.getdislikes=function(req,res)
{
    RatingModel.find({eventid:req.params.eventid, type:'dislike'}, function (err, doc)
    {
        if(!err)
        {
            if (!doc) {

                res.send('0');

            }
            else {
                res.send('' + doc.length);
            }
        }
        else
        {
            res.send('error');
        }

    });

}

exports.unlike = function(req,res)
{

    console.log(req.params.evid +","+ req.params.id);
    RatingModel.findOne({userid:req.params.id,eventid:req.params.evid, type:'like'}, function (err, doc)
    {
        if(!err)
        {
            if (!doc) {

                res.send('error');

            }
            else
            {
                doc.remove(function(err) {

                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else
                    {
                        res.send('success');
                    }
                });
            }
        }
        else
        {
            res.send('error');
        }

    });

}


exports.checkLike = function(req,res)
{

    console.log(req.params.evid +","+ req.params.id);
    RatingModel.findOne({userid:req.params.id,eventid:req.params.evid, type:'like'}, function (err, doc)
    {
        if(!err)
        {
            if (!doc) {

                res.send('error');

            }
            else
            {
                res.send('duplicate')
            }
        }
        else
        {
            res.send('error');
        }

    });

}

exports.like=function (req, res)
{

    RatingModel.findOne({ userid:req.body.userid,eventid:req.body.eventid }, function (err, doc)
    {
        var rating = new RatingModel(req.body);
        if (!doc)
        {
                    var rating = new RatingModel(req.body);
                    console.log(rating);
                    rating.save(function(err) {

                        if (err) {
                            console.log("Error Occured");
                            res.send('error');
                        }
                        else {
                            res.send('success');
                        }
                    });
        }
        else
        {
            if(doc.type==='dislike')
            {
                doc.remove(function(err) {

                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else
                    { rating.save(function(err) {

                        if (err) {
                            console.log("Error Occured");
                            res.send('error');
                        }
                        else {
                            res.send('success');
                        }
                    });

                    }
                });
            }
            else
            {
                  res.send('duplicate');
            }
        }

    });
};


exports.dislike=function (req, res)
{

    RatingModel.findOne({ userid:req.body.userid,eventid:req.body.eventid }, function (err, doc)
    {
        var rating = new RatingModel(req.body);
        if (!doc)
        {

            console.log(rating);
            rating.save(function(err) {

                if (err) {
                    console.log("Error Occured");
                    res.send('error');
                }
                else {
                    res.send('success');
                }
            });
        }
        else
        {
            if(doc.type==='like')
            {
                doc.remove(function(err) {

                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else
                    { rating.save(function(err) {

                        if (err) {
                            console.log("Error Occured");
                            res.send('error');
                        }
                        else {
                            res.send('success');
                        }
                    });

                    }
                });
            }
            else
            {
                res.send('duplicate');
            }
        }

    });
};