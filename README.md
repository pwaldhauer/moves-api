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
    "refreshToken" : "",
});

// Redirect your user to this url
var url = moves.generateAuthUrl();

moves.getAccessToken(code_from_redirect, function(err, authData) {
    moves.options.accessToken = authData.access_token;

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

### MovesAPI#getSummaries(options, cb)

Returns [Daily summaries](https://dev.moves-app.com/docs/api_summaries)

**Arguments** 

 * `options` with the following possible keys:
   * date
   * week
   * month
   * updatedSince
   * pastDays
   * from 
   * to
 * `callback(err,body)`

**Example response**

 ```json
[{
    "date": "20130315",
    "summary": [
        {
            "activity": "walking",
            "group": "walking",
            "duration": 2133,
            "distance": 1847,
            "steps": 2500,
            "calories": 60
        },
        {
            "activity": "zumba",
            "duration": 1200,
            "calories": 500
        },
        ...
    ],
    "caloriesIdle": 1785,
    "lastUpdate": "20130317T121143Z"
},
...
]
```

### MovesAPI#getActivities(options, cb)

Returns [Daily activities](https://dev.moves-app.com/docs/api_activities)

**Arguments** 

 * `options` with the following possible keys:
   * date
   * week
   * month
   * updatedSince
   * from 
   * to
 * `callback(err,body)`

**Example response:**

 ```json
[
    {
        "date": "20121212",
        "summary": [
            {
                "activity": "walking",
                "group": "walking",
                "duration": 3333,
                "distance": 3333,
                "steps": 3333,
                "calories": 300
            }
        ],
        "segments": [
            {
                "type": "move",
                "startTime": "20121212T071430+0200",
                "endTime": "20121212T074617+0200",
                "activities": [
                    {
                        "activity": "walking",
                        "group": "walking",
                        "manual": false,
                        "startTime": "20121212T071430+0200",
                        "endTime": "20121212T072732+0200",
                        "duration": 782,
                        "distance": 1251,
                        "steps": 1353,
                        "calories": 99
                    },
                    {
                        "activity": "transport",
                        "group": "transport",
                        "manual": false,
                        "startTime": "20121212T072732+0200",
                        "endTime": "20121212T074616+0200",
                        "duration": 1124,
                        "distance": 8443
                    }
                ],
                "lastUpdate": "20130317T121143Z"
            },
            {
                "type": "place",
                "startTime": "20121212T074617+0200",
                "endTime": "20121212T100051+0200",
                "activities": [
                    {
                        "activity": "walking_on_treadmill",
                        "group": "walking",
                        "manual": true,
                        "duration": 270,
                        "steps": 303,
                        "calories": 99
                    }
                ],
                "lastUpdate": "20130317T121143Z"
            },
        ],
        "caloriesIdle": 1785,
        "lastUpdate": "20130317T121143Z"
    },
    {
        "date": "20121213",
        "summary": null,
        "segments": null,
        "caloriesIdle": 1785
    }
]
```

### MovesAPI#getActivitiesList(cb)

Returns [Activity List](https://dev.moves-app.com/docs/api_activity_list)

Lists supported activities. See [table of activities](https://dev.moves-app.com/docs/api_activity_list#activity_table) for current list.


**Arguments** 

 * `callback(err,body)`

**Example response:**

 ```json
[
    {
        "activity": "aerobics",
        "geo": false,
        "place": true,
        "color": "bc4fff",
        "units": "duration,calories"
    },
    {
        "activity": "badminton",
        "geo": false,
        "place": true,
        "color": "11d1cb",
        "units": "duration,calories"
    },
    ...
]
```


### MovesAPI#getPlaces(options, cb)

Returns [Daily places](https://dev.moves-app.com/docs/api_places)

**Arguments** 

 * `options` with the following possible keys:
   * date
   * week
   * month
   * updatedSince
   * from
   * to
 * `callback(err,body)`

**Example response:**

 ```json
[
    {
        "date": "20121212",
        "segments": [
            {
                "type": "place",
                "startTime": "20121212T000000+0200",
                "endTime": "20121212T071430+0200",
                "place": {
                    "id": 1,
                    "type": "unknown",
                    "location": {
                        "lat": 55.55555,
                        "lon": 33.33333
                    }
                },
                "lastUpdate": "20130317T121143Z"
            },
            {
                "type": "place",
                "startTime": "20121212T100715+0200",
                "endTime": "20121212T110530+0200",
                "place": {
                    "id": 4,
                    "name": "test",
                    "type": "foursquare",
                    "foursquareId": "4df0fdb17d8ba370a011d24c",
                    "foursquareCategoryIds": ["4bf58dd8d48988d125941735"],
                    "location": {
                        "lat": 55.55555,
                        "lon": 33.33333
                    }
                },
                "lastUpdate": "20130317T121143Z"
            }
    },
    {
        "date": "20121213",
        "segments": null
    }
]
```

## Contribute

Feel free to contribute and add the other API endpoints! :)
