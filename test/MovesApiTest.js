var assert = require('assert');
var fs = require('fs');

if(!fs.existsSync(__dirname + '/../config.json')) {
    throw new Error('Please create a valid config.json to run the tests. (See config.sample.json)');
}

var MovesApi = require(__dirname + '/../lib/MovesApi').MovesApi;

var real_config = require(__dirname + '/../config');

var mock_config = {
    clientId: 'id',
    clientSecret: 'secret'
};

var mock_config_token = {
    clientId: real_config.clientId,
    clientSecret: real_config.clientSecret,
    accessToken: 'WRONG_TOKEN'
};

describe('MovesApi', function() {

    describe('#generateAuthUrl', function() {

        it('should return an error if clientId or clientSecret are not set', function(done) {
            var moves = new MovesApi();
            var url = moves.generateAuthUrl();

            assert.equal(url instanceof Error, true, 'Return value should be of type Error');

            done();
        });

        it('should return the correct url when the clientId is set', function(done) {
            var url = new MovesApi(mock_config).generateAuthUrl();

            assert.equal(url instanceof Error, false, 'Return value should not be of type Error');
            assert.equal(url.indexOf(mock_config.clientId) != -1, true, 'URL should contain the client id');
            assert.equal(url.indexOf('activity location') != -1, true, 'URL should include the correct scope');

            done();
        });

        it('should return include the redirect uri if set', function(done) {
            mock_config.redirectUri = 'redirect';
            var url = new MovesApi(mock_config).generateAuthUrl();

            assert.equal(url instanceof Error, false, 'Return value should not be of type Error');
            assert.equal(url.indexOf(mock_config.clientId) != -1, true, 'URL should contain the client id');
            assert.equal(url.indexOf(mock_config.redirectUri) != -1, true, 'URL should include the redirect uri');

            done();
        });

        it('should return include correct scope if set', function(done) {
            var url = new MovesApi(mock_config).generateAuthUrl(['activity']);

            assert.equal(url instanceof Error, false, 'Return value should not be of type Error');

            assert.equal(url.indexOf('activity') != -1, true, 'URL should include the correct scope');
            assert.equal(url.indexOf('location') != -1, false, 'URL should include the correct scope');

            done();
        });

    });

    describe('#getAccessToken', function() {

        it('it should return an error if the code is wrong', function(done) {
            (new MovesApi(real_config)).getAccessToken('WRONG_CODE', function(err, token) {
                assert.equal(err == null, false, 'The error should be set');
                assert.equal(err, 'invalid_grant', 'The error should be invalid_grant');

                assert.equal(!token, true, 'The token should not be set');
                done();
            });
        });

        // Successful auth not testable without user interaction, I guess.

    });

    describe('#verifyToken', function() {

        it('should return an error if no access token is set', function(done) {
            (new MovesApi(mock_config)).verifyToken(function(err) {
                assert.equal(err == null, false, 'The error should be set');

                done();
            });
        });

        it('should return an error if the access token is wrong', function(done) {
            (new MovesApi(mock_config_token)).verifyToken(function(err) {
                assert.equal(err == null, false, 'The error should be set');

                done();
            });
        });

        it('should return no error if the token is valid', function(done) {
            (new MovesApi(real_config)).verifyToken(function(err) {
                assert.equal(err == null, true, 'The error should not be set');

                done();
            });
        })

    });

    describe('#getProfile', function() {

        it('should return an error if the token is invalid', function(done) {
            (new MovesApi(mock_config_token)).getProfile(function(err, profile) {
                assert.equal(err == null, false, 'The error should be set');
                assert.equal(err, 'expired_access_token', 'The error should be expired_access_token');

                done();
            });
        });

        it('should return the users profile', function(done) {
            (new MovesApi(real_config)).getProfile(function(err, profile) {
                assert.equal(err == null, true, 'The error should not be set');
                assert.equal(profile.hasOwnProperty('userId'), true, 'The userId should be set');

                done();
            });
        });

    });

    describe('#getStoryline', function() {

        it('should return an error if the date is out of range', function(done) {
            (new MovesApi(real_config)).getStoryline('20998811', function(err, storyline) {
                assert.equal(err == null, false, 'Error should be set');
                assert.equal(storyline == null, true, 'Storyline should be null');

                done();
            });
        });

        it('should return a single day for an existing date', function(done) {
           (new MovesApi(real_config)).getStoryline(real_config.goodDay, function(err, storyline) {
                assert.equal(err == null, true, 'Error should not be set');
                assert.equal(storyline == null, false, 'Storyline should not be null');
                assert.equal(storyline.length, 1, 'One day should be returned');

                assert.equal(storyline[0].date, real_config.goodDay, 'The day should be the requested one');

               done();
           });
        });

        it('should return a single day for an existing date, including trackpoints', function(done) {
           (new MovesApi(real_config)).getStoryline({from: real_config.goodDay, trackPoints: true}, function(err, storyline) {
                assert.equal(err == null, true, 'Error should not be set');
                assert.equal(storyline == null, false, 'Storyline should not be null');
                assert.equal(storyline.length, 1, 'One day should be returned');

                // Find first 'move' and check for trackPoints
                var found = false;
                storyline[0].segments.forEach(function(segment) {
                    if(segment.type == 'move' && segment.activities) {
                        segment.activities.forEach(function(activity) {
                            if(activity.trackPoints) {
                                found = true;
                                return;
                            }
                        });

                        if(found) {
                            return;
                        }
                    }
                })

                assert.equal(storyline[0].date, real_config.goodDay, 'The day should be the requested one');
                assert.equal(found, true, 'TrackPoints should be included');

               done();
           });
        });

        it('should return multiple days for an existing date', function(done) {
           (new MovesApi(real_config)).getStoryline(real_config.goodRange, function(err, storyline) {
                assert.equal(err == null, true, 'Error should not be set');
                assert.equal(storyline == null, false, 'Storyline should not be null');
                assert.equal(storyline.length, 5, 'One day should be returned');

                assert.equal(storyline[0].date, real_config.goodRange.from, 'Check first day of range');
                assert.equal(storyline[storyline.length - 1].date, real_config.goodRange.to, 'Check first day of range');

               done();
           });
        });


    });

});
