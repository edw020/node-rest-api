const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');
const io = require('../socket');

describe('Feed Controller', function(){
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

    it('should add a created post to the posts of the creator', function(done){
        const req = {
            body: {
                title: 'Test post',
                content: 'A test post',
            },
            file: {
                path: 'asdfasdf'
            },
            userId: '5ce97f9e39515875b5900d69'
        };
        const res = {
            status: function(){ return this; },
            json: () => {}
        };

        sinon.stub(io, 'getIO');
        io.getIO = function () {
            return {
                emit: function(){}
            }
        };

        FeedController.createPost(req, res, () => {})
            .then(savedUser => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
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