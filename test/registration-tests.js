
process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
var expect = require('expect.js');
var mongoose=require('mongoose');
var User = require('../public/models/user');
var Preferences = require('../public/models/preferences');

var profile = require('./profile-tests');
var login = require('./login-tests');
var event=require('./event-tests');

chai.use(chaiHttp);

var signup=false;
var user=null;

//This is our Sign Up Module Test Suite
var x=describe('Sign Up Test Suite', function()
{


    it('should add a SINGLE user on /signup POST', function (done) {
        chai.request(server)
            .post('/signup')
            .send({'fname': 'Test', 'lname': 'Test', 'email': 'test@gmail.com', 'password': 'Hello123'})
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                res.text.should.equal('success');
                signup=true;
                done();
            });
    });


    it('should NOT add a  user that violates the schema on /signup POST', function (done) {

        chai.request(server)
            .post('/signup')
            .send({'fname': 'Test', 'lname': 'Test', 'email': '', 'password': 'Hello123'})
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                res.text.should.equal('error');
                done();
            });
    });


    it('should retrieve user info based on his email', function (done) {

        var email='test@gmail.com';
        chai.request(server)
            .get('/getUserInfo/'+ email)
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                res.body.should.have.property('id');
                res.body.should.have.property('fname');
                res.body.should.have.property('lname');
                res.body.should.have.property('email');
                res.body.fname.should.equal('Test');
                res.body.email.should.equal('test@gmail.com');
                user=res.body;
                signup=true;
                done();
            });

        login.runLoginTests(signup);
    });



});




//The preferences Test Suite
describe('Preferences Test Suite', function()
{


    it('Should be able to insert a user preference', function (done)
    {
        expect(signup).to.eql(true);

        chai.request(server)
            .post('/preferences')
            .send({'id':user.id, 'gender':'male','city':'Boston',
                'categories':[{'categoryText':'Business & Networking','category':'business'}]})
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                //expect(signup).to.eql(true);
                res.should.have.status(200);
                res.text.should.equal('success');
                done();
            });
    });


    it('Should not be able to save preferences when the Preferences schema is violated', function (done)
    {
        expect(signup).to.eql(true);

        chai.request(server)
            .post('/preferences')
            .send({'id':undefined, 'gender':'male','city':'Boston',
                'categories':[{'categoryText':'Business & Networking','category':'business'}]})
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                res.text.should.equal('error');
                done();
            });
    });



    it('Should be able to retrieve preferences when user id is provided', function (done)
    {
        expect(signup).to.eql(true);


        chai.request(server)
            .get('/preferences/'+ user.id)
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body[0].should.have.property('category');
                res.body[0].should.have.property('categoryText');
                done();
            });
    });




    it('Should be able return null when no matching user id is found', function (done)
    {
        expect(signup).to.eql(true);


        chai.request(server)
            .get('/preferences/'+ user.id+"10394")
            .end(function (err, res)
            {
                expect(err).to.eql(null)
                res.should.have.status(200);
                expect(res.body).to.eql({});
                done();
            });

        profile.runProfileTests(user.id);
        event.runEventTests(user.id);
    });



});



