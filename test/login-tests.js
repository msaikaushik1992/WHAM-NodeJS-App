/**
 * Created by toshiba on 12/2/2015.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
var expect = require('expect.js');
var mongoose=require('mongoose');
var User = require('../public/models/user');
var Preferences = require('../public/models/preferences');


exports.runLoginTests=function(signup)
{
    //This is our Login Test Suite Test Suite
    describe('Login Test Suite', function()
    {

        it('Should authenticate a user with correct email-password combination /signup POST', function(done)
        {

            expect(signup).to.eql(true);

            chai.request(server)
                .post('/login')
                .send({'email':'test@gmail.com','password':'Hello123'})
                .end(function(err, res)
                {
                    expect(err).to.eql(null)
                    //expect(signup).to.eql(true);
                    res.should.have.status(200);
                    res.body.should.have.property('fname');
                    res.body.should.have.property('lname');
                    res.body.should.have.property('email');
                    res.body.fname.should.equal('Test');
                    res.body.email.should.equal('test@gmail.com');
                    done();
                });
        });


        it('should not not authenticate an unauthorized user /signup POST', function(done)
        {

            expect(signup).to.eql(true);

            chai.request(server)
                .post('/login')
                .send({'email':'test@gmail.com','password':'Hello'})
                .end(function(err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(401);
                    done();
                });
        });


    });

}