const expect = require('chai').expect;
const NextcloudStrategy = require('../lib/strategy');

describe('Profile', function() {
  describe('fetched from default endpoint', function() {
    let profile;

    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (accessToken !== 'token') {
        return callback(new Error('incorrect token argument'));
      }

      const body = JSON.stringify({
        ocs:
        {
          meta: {status: 'ok', statuscode: 200, message: 'OK'},
          data:
          {
            'enabled': true,
            'storageLocation': '/var/lib/nextcloud/data//johnsmith',
            'id': 'johnsmith',
            'lastLogin': 1572525271000,
            'backend': 'Database',
            'subadmin': [],
            'quota': [],
            'email': 'john.smith@example.com',
            'phone': '',
            'address': '',
            'website': '',
            'twitter': '',
            'groups': [],
            'language': 'en',
            'locale': '',
            'backendCapabilities': [],
            'display-name': 'John Smith'
          }
        }
      });

      callback(null, body, undefined);
    };

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) {
          return done(err);
        }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.provider).to.equal('nextcloud');
      expect(profile.id).to.equal('johnsmith');
      expect(profile.username).to.equal('johnsmith');
      expect(profile.displayName).to.equal('John Smith');
      expect(profile.emails[0].value).to.equal('john.smith@example.com');
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  });

  describe('error caused by invalid token', function() {
    let err;

    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    strategy._oauth2.get = function(url, accessToken, callback) {
      const body = JSON.stringify({
        error: {
          message: 'Invalid OAuth access token.',
          type: 'OAuthException',
          code: 190,
          fbtraceid: 'XxXXXxXxX0x'
        }
      });

      callback({statusCode: 400, data: body});
    };

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
    });
  });

  describe('error caused by malformed response', function() {
    let err;

    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    strategy._oauth2.get = function(url, accessToken, callback) {
      const body = 'Hello, world.';
      callback(null, body, undefined);
    };

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  });

  describe('internal error', function() {
    let err;
    let profile;

    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    };

    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });

    it('should not load profile', function() {
      expect(profile).to.be.an('undefined');
    });
  });
});
