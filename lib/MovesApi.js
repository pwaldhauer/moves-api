var request = require('request');
var querystring = require('querystring');

function MovesApi(options) {
    this.baseUrl = 'https://api.moves-app.com/';

    this.options = options || {
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        accessToken: ''
    }
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

    if(this.options.redirectUri && this.options.redirectUri != '') {
        url += '&redirect_uri='  + this.options.redirectUri
    }

    return url;
}

MovesApi.prototype.getAccessToken = function getAccessToken(code, cb) {
    if(!checkConfig(this.options, ['clientId', 'clientSecret'], cb)) {
        return;
    }

    request.post(this.baseUrl + 'oauth/v1/access_token?grant_type=authorization_code' +
            '&code=' + code + '&client_id=' + this.options.clientId + '&client_secret=' +
            this.options.clientSecret + '&redirect_uri=' + this.options.redirectUri,

            function(error, response, body) {
                body = convertResponse(body);

                if(handleError(error, body, cb)) {
                    return;
                }

                cb(null, body.access_token)
    });
}

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

            cb(null)
    })
}

MovesApi.prototype.getProfile = function getProfile(cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    request.get(this.baseUrl + 'api/v1/user/profile?access_token=' + this.options.accessToken,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
}

MovesApi.prototype.getStoryline = function getStoryline(options, cb) {
    if(!checkConfig(this.options, ['accessToken'], cb)) {
        return;
    }

    var url = this.baseUrl + 'api/v1/user/storyline/daily';
    var query = {
        'access_token': this.options.accessToken
    };

    if(options instanceof Object) {
        if(options.from && options.to) {
            query.from = options.from;
            query.to= options.to;
        }

        if(options.trackPoints) {
            query.trackPoints = options.trackPoints;
        }

        if(options.from && !options.to) {
            url += '/' + options.from
        }
    } else {
        url += '/' + options;
    }

    url = url + '?' + querystring.stringify(query);

    request.get(url,
        function(error, response, body) {
            body = convertResponse(body);

            if(handleError(error, body, cb)) {
                return;
            }

            cb(null, body);
        });
}

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
}

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
}

var checkConfig = function checkConfig(options, values, cb) {
    var error = null;
    values.forEach(function(value) {
        if(!options[value] || options[value] == '') {
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
}

exports.MovesApi = MovesApi;
