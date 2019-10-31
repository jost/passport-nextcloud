# NOT TESTED - WIP - USE AT YOUR OWN RISK

# passport-nextcloud

Based on [passport-gitlab2](https://github.com/fh1ch/passport-gitlab2).

[![npm version](https://badge.fury.io/js/passport-nextcloud.svg)](http://badge.fury.io/js/passport-nextcloud)

[Passport](http://passportjs.org/) strategy for authenticating with
[Nextcloud](https://nextcloud.com/) using the OAuth2 authentication provider service.

This module lets you authenticate using Nextcloud in your Node.js applications.
By plugging into Passport, Nextcloud authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-nextcloud
```

## Usage

Before using the OAuth2 authentication provider service, you have register a new 
application in the admin security settings. nextcloud will then issue an 
application ID and a secret, which need to be provided to the strategy. You will 
also need to configure a redirect URI which matches the route in your application.

#### Configure Strategy

The Nextcloud authentication strategy authenticates uses a Nextcloud account and 
OAuth 2.0 tokens. The app ID and secret obtained when creating an application 
are supplied as options when creating the strategy. The strategy also requires a 
`verify` callback, which receives the access token and optional refresh token, 
as well as `profile` which contains the authenticated user's Nextcloud profile. 
The `verify` callback must call `cb` providing a user to complete authentication.

```js
passport.use(new NextcloudStrategy({
    clientID: NEXTCLOUD_APP_ID,
    clientSecret: NEXTCLOUD_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/nextcloud/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({gitlabId: profile.id}, function (err, user) {
      return cb(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'nextcloud'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/nextcloud', passport.authenticate('nextcloud'));

app.get('/auth/nextcloud/callback',
  passport.authenticate('nextcloud', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

#### Code style

This module uses the [Google JavaScript Code-Style](https://google.github.io/styleguide/javascriptguide.xml)
and enforces it using [JSCS](http://jscs.info/) as additional linter beneath
[JSHint](http://jshint.com/). These measures ensuring a high level of code
quality and easy maintainability of it. You can test if your changes comply
with the code style by executing:

```bash
$ make lint
```

#### Tests

The test suite is located in the `test/` directory. All new features are
expected to have corresponding test cases. Ensure that the complete test suite
passes by executing:

```bash
$ make test
```

#### Coverage

The test suite covers 100% of the code base. All new feature development is
expected to maintain that level. Coverage reports can be viewed by executing:

```bash
$ make coverage-view
```

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2019 Sebastian Hugentobler <sebastian@vanwa.ch>
