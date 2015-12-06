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


exports.runProfileTests=function(id)
{
    describe('Profile Test Suite', function ()
    {

        after(function(done)
        {
            mongoose.connection.db.collection('users').drop();
            mongoose.connection.db.collection('preferences').drop();
            console.log("Dropped All Test Collections");
            done();
        });


        it('It should retrieve the correct information of the user /profile GET', function (done) {


            chai.request(server)
                .get('/profileinfo/'+ id)
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('city');
                    res.body.should.have.property('gender');
                    res.body.should.have.property('categories');
                    res.body.city.should.equal('Boston');
                    res.body.id.should.equal(id);
                    done();
                });
        });


        it('The user profile info should be updated', function (done) {


            chai.request(server)
                .put('/updatePreferences/'+ id)
                .send({'id':id, 'gender':'Female','city':'Chicago',
                    'categories':[{'categoryText':'Business & Networking','category':'business'}]})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });
        });


        it('The user should be able to update his password', function (done) {

            chai.request(server)
                .put('/updatePassword/'+ id)
                .send({'oldPassword':'Hello123', 'newPassword':'Hello1234'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('success');
                    done();
                });
        });


        it('The user should not be able to update password if his current' +
            ' password is wrong.', function (done) {

            chai.request(server)
                .put('/updatePassword/'+ id)
                .send({'oldPassword':'Hello123', 'newPassword':'Hello1234'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('error');
                    done();
                });
        });


        it('It should return error when no record is found', function (done) {

            chai.request(server)
                .put('/updatePassword/'+ null)
                .send({'oldPassword':'Hello123', 'newPassword':'Hello1234'})
                .end(function (err, res)
                {
                    expect(err).to.eql(null)
                    res.should.have.status(200);
                    res.text.should.equal('error');
                    done();
                });
        });

    });
}