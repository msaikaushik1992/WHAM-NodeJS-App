/**
 * Created by toshiba on 12/6/2015.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
var expect = require('expect.js');
var mongoose=require('mongoose');
var User = require('../public/models/user');
var Preferences = require('../public/models/preferences');


exports.runEventTests=function(id) {
    describe('Event Test Suite', function ()
    {
       after(function(done)
        {
            mongoose.connection.db.collection('ratings').drop();
            console.log("Dropped All Ratings");
            done();
        });

        it('It should like an event /likeEvent POST', function (done)
        {

            chai.request(server)
                .post('/likeEvent')
                .send({'userid': id, 'eventid':'E0-001-000278174-6' ,'categories': '', 'type': 'like',
                    'title':'Martini Tasting','img':'http://url/eventful/img-1239'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });

        });


        it('It should return duplicate when you like the same event again /likeEvent POST', function (done)
        {

            chai.request(server)
                .post('/likeEvent')
                .send({'userid': id, 'eventid':'E0-001-000278174-6' ,'categories': '', 'type': 'like',
                    'title':'Martini Tasting','img':'http://url/eventful/img-1239'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('duplicate');
                    done();
                });

        });


        it('It should return a list of all liked events', function (done)
        {

            chai.request(server)
                .get('/getLikedEvents/' + id)
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.equal(1);
                    done();
                });

        });


        it('It should retrieve the number of likes', function (done) {


            chai.request(server)
                .get('/getlikes/'+ 'E0-001-000278174-6')
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('1');
                    done();
                });
        });

        it('It should like another event ', function (done) {

            chai.request(server)
                .post('/likeEvent')
                .send({
                    'userid': id, 'eventid': 'E0-001-000278174-5', 'categories': '', 'type': 'like',
                    'title': 'Wine Tasting', 'img': 'http://url/eventful/img-1239'
                })
                .end(function (err, res) {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });
        });


        it('It should return 2 as the number of events liked', function (done) {


            chai.request(server)
                .get('/getLikedEvents/' + id)
                .end(function (err, res) {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.equal(2);
                    done();
                });
        });

        it('It should unlike the event added recently', function (done) {


            chai.request(server)
                .delete('/unlike/'+ 'E0-001-000278174-5' +'/' + id)
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });

        });


       it('It should  dislike an event /dislikeEvent POST', function (done)
        {

            chai.request(server)
                .post('/dislikeEvent')
                .send({'userid': id, 'eventid':'E0-001-000278174-6' ,'categories': '', 'type': 'dislike',
                    'title':'Martini Tasting','img':'http://url/eventful/img-1239'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });

        });


        it('Disliking an event again should return duplicate', function (done)
        {

            chai.request(server)
                .post('/dislikeEvent')
                .send({'userid': id, 'eventid':'E0-001-000278174-6' ,'categories': '', 'type': 'dislike',
                    'title':'Martini Tasting','img':'http://url/eventful/img-1239'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('duplicate');
                    done();
                });

        });


        it('It should retrieve the number of dislikes', function (done) {


            chai.request(server)
                .get('/getdislikes/'+ 'E0-001-000278174-6')
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('1');
                    done();
                });
        });


        it('THe number of likes should now be 0', function (done)
        {


            chai.request(server)
                .get('/getlikes/'+ 'E0-001-000278174-6')
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('0');
                    done();
                });

        });

    });
}