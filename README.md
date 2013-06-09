# moves-api

NodeJS module to use the Moves.app API. Currently only authentication and the Storyline endpoint is supported. For more information about the API please refer to the [official documentation](https://dev.moves-app.com/docs/api).

## Usage

```javascript
var movesApi = require('moves-api').MovesApi;
var moves = new movesApi({
    "clientId": "ClientId",
    "clientSecret": "ClientSecret",
    "redirectUri": "RedirectUri",
    "accessToken": "",
});

// Redirect your user to this url
var url = moves.generateAuthUrl();

moves.getAccessToken(code_from_redirect, function(err, accessToken) {
    moves.options.accessToken = accessToken;

    moves.getProfile(function(err, profile) {
        console.log(profile);
    });
});
```

For more usage examples take a look at the tests or [Elizabeth](https://github.com/pwaldhauer/elizabeth), my script to export your Moves.app data, which uses this module. Surprise!

## Methods

### MovesApi#generateAuthUrl(scope)

Generates the URL the user needs to visit to start the authentication. `scope` should be an array of the scopes needed (`location`, `activity`)

### MovesApi#getAccessToken(code, cb)

If provided with the access code given back from the Moves.app API this will get you the access token to use for the other requests. The callback should be a `function(err, accessToken) {}`.

### MovesApi#verifyToken(cb)

Verifies the configured access token. The callback should be a `function(err) {}`.

### MovesApi#getProfile(cb)

Returns the profile of the authenticated user. The callback should be a `function(err, profile) {}`.

### MovesApi#getStoryline(options, cb)

Returns storylines! `options` may just be a string identifying a single day (`20130401`) or an object to specify a date range or include the trackPoints: `{ from: "20130401", to: "20130405", trackPoints: false}`.

## Contribute

Feel free to contribute and add the other API endpoints! :)
