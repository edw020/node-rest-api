const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function(){
    it('should throw an error with code 500 if accessing database fails', function(done){
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'testtest'
            }
        };

        AuthController.login(req, {}, Function).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });

        User.findOne.restore();
    });
});

describe('Auth Controller - getStatus', function(){
    before(function(done){
        mongoose.connect('mongodb+srv://edward:P4ssw0rd2o19@cluster0-hehis.mongodb.net/test-messages?retryWrites=true')
            .then(result => {
                const user = new User({
                    email: 'testing@test.com',
                    password: 'testing',
                    name: 'Test',
                    post: [],
                    _id: '5ce97f9e39515875b5900d69'
                });

                return user.save();
            })
            .then(() => {
                done();
            });
    });

    it('should send a response with a valid user status for an existing user', function(done){

        const req = {userId: '5ce97f9e39515875b5900d69'};
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code){
                this.statusCode = code;
                return this;
            },
            json: function(data){
                this.userStatus = data.status;
            }
        };

        AuthController.getStatus(req, res, Function)
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('I am new');
                done();
            });
    });

    after(function(done){
        User.deleteMany({}) // Deletes all records on Users table
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});