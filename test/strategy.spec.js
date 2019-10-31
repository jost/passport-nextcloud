const expect = require('chai').expect;
const NextcloudStrategy = require('../lib/strategy');

describe('Strategy', function() {
  describe('constructed', function() {
    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    it('should be named nextcloud', function() {
      expect(strategy.name).to.equal('nextcloud');
    });
  });

  describe('constructed with custom baseURL', function() {
    const strategy = new NextcloudStrategy({
      baseURL: 'https://nextcloud.example.com',
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() { });

    it('should have correct profile URL', function() {
      expect(strategy._profileURL).to.equal('https://nextcloud.example.com/ocs/v2.php/cloud/user?format=json');
    });
  });

  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        // jshint unused:false
        new NextcloudStrategy(undefined, function() { });
      }).to.throw(Error);
    });
  });
});
