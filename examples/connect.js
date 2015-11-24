"use strict";
/**
 * Example implementation of Moves API
 * requires valid config.json file
 *
 * How to use:
 *   - Visit dev.moves-app.com, and create a new App
 *   - configure redirectUri to be "http://localhost:3000/auth"
 *   - copy config.sample.json to config.json, entering values from dev.moves-app.com
 *   - execute with `node connect.js`
 *   - open your browser and navigate to http://localhost:3000
 *
 * Expected behavior:
 *   - upon initial visit, you should be redirected to the Moves "connect" instructions
 *   - upon completing "connect", you should be redirected
 */

var http = require('http');
var MovesApi = require('../lib/MovesApi').MovesApi;
var config = require('../config.json');
var fs = require('fs');
var moves = new MovesApi({
  clientId:config.clientId,
  clientSecret:config.clientSecret,
  redirectUri:config.redirectUri
});

/**
 * handles inbound requests
 * if 'code' is provided, redeem code for accessToken and log it to the console
 * otherwise, redirect to the Moves auth URL  
 **/
function handleRequest(req, res){
    var authCodeRegex = /code=(.*)&.*/gi;
    var urlMatch = authCodeRegex.exec(req.url)
    
    if(urlMatch ){
      var authCode = urlMatch[1];
      config.authCode = authCode;
      moves.getAccessToken(authCode,function(err,authData){
        if(err){
          console.error(err);
          res.end("Moves API Error: "+err)
          return;
        }
        console.log("Connected to Moves")
        console.log(JSON.stringify(authData))
        res.end("Connected to Moves. "+JSON.stringify(authData));
        process.exit(0);
      })
      return;
    }
    console.log("Redirecting to Moves Auth Url")
    res.writeHead(302, {'Location': moves.generateAuthUrl()});
    res.end();
 }

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(3000, function(){
    console.log("Visit http://localhost:3000 to connect to Moves");
});
