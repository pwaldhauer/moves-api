var request = require('request');
var querystring = require('querystring');
var moment = require('moment');

function MovesApi(options) {
    this.baseUrl = 'https://api.moves-app.com/';

    this.options = options || {
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        accessToken: '',
        refreshToken: '',
    };
}

MovesApi.prototype.generateAuthUrl = function generateAuthUrl(scope) {
    var err = checkConfig(this.options, ['clientId']);
    if(err instanceof Error) {
        return err;
    }

    if(!scope) {
        scope = ['activity', 'location'];
    }

    var url = this.baseUrl + 'oauth/v1/authorize?response_type=code&client_id=' +
        this.options.clientId + '&scope=' + scope.join(' ');

    if(this.options.redirectUri && this.options.redirectUri !== '') {
        url += '&redirect_uri='  + this.options.redirectUri;
    }

    return url;
};

MovesApi.prototype.getAccessToken = function getAccessToken(code, cb) {
    if(!checkConfig(this.options, ['clientId', 'clientSecret'], cb)) {
        return;
    }

    request.post(this.baseUrl + 'oauth/v1/access_token?grant_type=authorization_code' +
            '&code=' + code + '&client_id=' + this.options.clientId + '&client_secret=' +
            this.options.clientSecret + '&redirect_uri=' + this.options.redirectUri,

            function(error, response, body) {
                body = convertResponse(body);
                this.options.refreshToken = body.refresh_token;
                if(handleError(error, body, cb)) {
                    return;
                }

                cb(null, body);
            }.bind(this)
    );
};

MovesApi.prototype.verifyToken = function verifyToken(cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    request.get(this.baseUrl + 'oauth/v1/tokeninfo?access_token=' + this.options.accessToken,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null);
    });
};

// https://dev.moves-app.com/docs/api_profile
MovesApi.prototype.getProfile = function getProfile(cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    request.get(this.baseUrl + 'api/1.1/user/profile?access_token=' + this.options.accessToken,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
};

// https://dev.moves-app.com/docs/api_summaries
MovesApi.prototype.getSummaries = function getSummaries(options, cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/1.1/user/summary/daily';
    url = urlStructure(url, options, this.options.accessToken);

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
};

// https://dev.moves-app.com/docs/api_activities
MovesApi.prototype.getActivities = function getActivities(options, cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/1.1/user/activities/daily';
    url = urlStructure(url, options, this.options.accessToken);

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
};

// https://dev.moves-app.com/docs/api_places
MovesApi.prototype.getPlaces = function getPlaces(options, cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/1.1/user/places/daily';
    url = urlStructure(url, options, this.options.accessToken);

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
};

// https://dev.moves-app.com/docs/api_storyline
MovesApi.prototype.getStoryline = function getStoryline(options, cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/1.1/user/storyline/daily';
    url = urlStructure(url, options, this.options.accessToken);

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
};

MovesApi.prototype.getActivitiesList = function getActivitiesList(cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/1.1/activities';

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });

};

var urlStructure = function(url, options, access_token) {

    var query = {
        'access_token': access_token
    };

    if(options instanceof Object) {
        if(options.date) {

            url += '/' + moment(options.date).format('YYYYMMDD');

        } else if(options.week) {

            url += '/' + moment(options.week).format('YYYY-[W]ww');

        } else if(options.month) {

            url += '/' + moment(options.month).format('YYYYMM');

        } else if(options.from && options.to) {

            query['from'] = moment(options.from).format('YYYYMMDD');
            query['to'] = moment(options.to).format('YYYYMMDD');

        } else if(options.pastDays) {

            var pastDays = options.pastDays;

            if (pastDays > 31) {
                pastDays = 31;
            } else if(pastDays < 0) {
                pastDays = 0;
            }

            query['pastDays'] = pastDays;
        }

        if(options.updatedSince) {
            query['updatedSince'] = moment(options.updatedSince).toISOString();
        }

        if(options.trackPoints) {
            query['trackPoints'] = !!options.trackPoints;
        }

    } else {
        url += '/' + options;
    }

    url = url + '?' + querystring.stringify(query);

    return url;
};

var handleError = function handleError(error, body, cb) {
    if(error) {
        cb(error);
        return true;
    }

    if(body.error) {
        cb(body.error);
        return true;
    }

    return false;
};

var convertResponse = function convertResponse(body) {
    if (body instanceof Object) {
        return body;
    }

    try {
        body = JSON.parse(body);
        return body;
    } catch(e) {
        return {'error': body};
    }
};

var checkConfig = function checkConfig(options, values, cb) {
    var error = null;
    values.forEach(function(value) {
        if(!options[value] || options[value] === '') {
            error = new Error('You need to set ' + value);
            return;
        }
    });

    if(cb && error != null) {
        cb(error);

        return false;
    }

    if(error != null) {
        return error;
    }

    return true;
};

exports.MovesApi = MovesApi;
