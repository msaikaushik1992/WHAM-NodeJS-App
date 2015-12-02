var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comment = mongoose.Schema({
    username: { type: String, required: true },
    date: { type: String },
    commentText: { type: String, required: true },
    email: { type: String }
});

var EventSchema = mongoose.Schema({
    eventid: { type: String, required: true },
    comments: [comment],
    likes: [{ type: String, unique: true }],
    dislikes: [{ type: String, unique: true }],
    rating: { type: Number }
});

EventModel = mongoose.model('Event', EventSchema);


exports.insertComment = function (req, res) {
    var eventId = req.params.eventid;

    EventModel.findOne({ eventid: eventId }, function (err, doc) {
        if (!doc) {
            console.log("err");
            var comments = [];
            comments.push(req.body);
            var event = {
                eventid: eventId,
                comments: comments,
                likes: [],
                dislikes: [],
                rating: 0
            };
            var eventData = new EventModel(event);
            eventData.save(function (err,savedEvent) {
                if (err) {
                    console.log("Error Occured");
                    res.send('error');
                }
                else {
                    console.log(savedevent);
                    res.json(savedEvent);
                }
            });
        }
        else {
            console.log("not err");
            doc.comments.push(req.body);
            doc.save(function (err) {
                if (err) {
                    console.log("Error Occured");
                    res.send('error');
                }
                else {
                    res.json(doc);
                }
            });
        }
    });
};



exports.getEvent = function (req, res) {
    EventModel.findOne({ eventid: req.params.eventid }, function (err, event) {
        if (err) {
            console.log('error occured');
            res.send('error');

        }
        else {

            res.send(event);
        }
    });
};

exports.increaseLikeCount = function (req, res) {
    var eventId = req.params.eventid;
    var email = req.params.email;

    EventModel.findOne({ eventid: eventId }, function (err, doc) {
        if (!doc) {
            console.log("err");
            var event = {
                eventid: eventId,
                comments: [],
                likes: [email],
                dislikes: [],
                rating: 0
            };
            var eventData = new EventModel(event);
            eventData.save(function (err) {
                if (err) {
                    console.log("Error Occured");
                    res.send('error');
                }
                else {
                    res.send('successincrementlike');
                }
            });
        }
        else {
            var likes = doc.likes;
            var dislikes = doc.dislikes;
            if (!emailPresent(likes, email) && emailPresent(dislikes, email)) {
                var dLikes = removeEmail(dislikes, email);
                doc.dislikes = dLikes;
                doc.likes.push(email);
                doc.save(function (err) {
                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else {
                        res.send('incrementLikeDecrementDislike');
                    }
                });
            }
            else if (!emailPresent(likes, email) && !emailPresent(dislikes, email)) {
                doc.likes.push(email);
                doc.save(function (err) {
                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else {
                        res.send('incrementLike');
                    }
                });
            }

        }
    });
};

exports.increasedisLikeCount = function (req, res) {
    var eventId = req.params.eventid;
    var email = req.params.email;

    EventModel.findOne({ eventid: eventId }, function (err, doc) {
        if (!doc) {
            console.log("err");
            var event = {
                eventid: eventId,
                comments: [],
                likes: [],
                dislikes: [email],
                rating: 0
            };
            var eventData = new EventModel(event);
            eventData.save(function (err) {
                if (err) {
                    console.log("Error Occured");
                    res.send('error');
                }
                else {
                    res.send('successincrementdislike');
                }
            });
        }
        else {
            var likes = doc.likes;
            var dislikes = doc.dislikes;
            if (emailPresent(likes, email) && !emailPresent(dislikes, email)) {
                var likesNEw = removeEmail(likes, email);
                doc.likes = likesNEw;
                doc.dislikes.push(email);
                doc.save(function (err) {
                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else {
                        res.send('incrementdisLikeDecrementlike');
                    }
                });
            }
            else if (!emailPresent(likes, email) && !emailPresent(dislikes, email)) {
                doc.dislikes.push(email);
                doc.save(function (err) {
                    if (err) {
                        console.log("Error Occured");
                        res.send('error');
                    }
                    else {
                        res.send('incrementdisLike');
                    }
                });
            }

        }
    });
};

exports.deleteComment = function (req, res) {
    var eventId = req.params.eventid;
    var commentid = req.params.commentid;
    EventModel.findOne({ eventid: eventId }, function (err, doc) {
        var comments = doc.comments;
        for (var i = 0; i < comments.length; i++) {
            if (comments[i]._id == commentid) {
                comments.splice(i, 1);
            }
        }
        doc.comments = comments;
        doc.save(function (err, doc) {
            res.json(doc);
        });
    });
}

function emailPresent(likeDLike, email) {
    for (var i = 0; i < likeDLike.length; i++) {
        if (likeDLike[i] == email) {
            return true;
        }
    }
    return false;
}

function removeEmail(likeDLike, email) {
    for (var i = 0; i < likeDLike.length; i++) {
        if (likeDLike[i] == email) {
            likeDLike.splice(i, 1);
        }
    }
    return likeDLike;
}