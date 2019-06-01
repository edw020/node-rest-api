const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function(){
    it('should throw an error if no authorization header exist', function(){
        const req = {
            get: function(){
                return null;
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
    });

    it('should throw an error if the authorization header is only one string', function(){
        const req = {
            get: function(){
                return 'xyz';
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it('should yield a userId decoding the token', function(){
        const req = {
            get: function(){
                return 'Bearer adfasfsd';
            }
        };

        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: '10001' });

        authMiddleware(req, {}, () => {});

        expect(req).to.have.property('userId', '10001');
        expect(jwt.verify.called).to.be.true;

        jwt.verify.restore();
    });

    it('should throw an error if the token cannot be verified', function(){
        const req = {
            get: function(){
                return 'Bearer xyz';
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
});