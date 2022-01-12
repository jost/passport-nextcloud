const url = require('url');
const util = require('util');
const OAuth2Strategy = require('passport-oauth2');
const InternalOAuthError = require('passport-oauth2').InternalOAuthError;

/**
 * Strategy constructor
 *
 * The Nextcloud authentication strategy authenticates requests by delegating to
 * Nextcloud using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Nextcloud application's App ID
 *   - `clientSecret`  your Nextcloud application's App Secret
 *   - `callbackURL`   URL to which Nextcloud will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new NextcloudStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/nextcloud/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  this._baseURL = options.baseURL;
  this._extraUrlElement = options.prettyURLs ? '' : 'index.php/';
  options.authorizationURL = options.authorizationURL || url.resolve(this._baseURL, this._extraUrlElement + 'apps/oauth2/authorize');
  options.tokenURL = options.tokenURL || url.resolve(this._baseURL, this._extraUrlElement + 'apps/oauth2/api/v1/token');
  options.scope = options.scope || 'read_user';
  options.scopeSeparator = options.scopeSeparator || ',';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'nextcloud';
  this._profileURL = options.profileURL || url.resolve(this._baseURL, 'ocs/v2.php/cloud/user?format=json');
  this._oauth2.useAuthorizationHeaderforGET(true);
}

// Inherit from OAuth2Strategy
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Nextcloud
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `nextcloud`
 *   - `id`               the user's Nextcloud ID
 *   - `username`         the user's Nextcloud username
 *   - `displayName`      the user's full name
 *   - `emails`           the proxied or contact email address granted by the user
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  const self = this;

  self._oauth2.get(self._profileURL, accessToken, function(err, body) {
    let json;

    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    const profile = {
      id: String(json.ocs.data.id),
      username: json.ocs.data['display-name'],
      displayName: json.ocs.data['display-name'],
      emails: [{value: json.ocs.data.email}]
    };

    profile.provider = 'nextcloud';
    profile._raw = body;
    profile._json = json;
    done(null, profile);
  });
};

// Expose constructor
module.exports = Strategy;
