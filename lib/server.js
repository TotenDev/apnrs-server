//
// server.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var restify = require('restify'),
    assert = require('assert'),
    device = require('./APNDevice.js');
/**
* Initialize APNRestServer function
* @param Object options - options object - REQUIRED
* @param String options.clientSecretUser - String to be used as username on client requests - REQUIRED
* @param String options.serverSecretUser - String to be used as username on server requests - REQUIRED
* @param String options.commonSecretPass - String to be used as passowrd on client/server requests - REQUIRED
* @param integer options.serverPort - Integer to be used as port on server, BUT if process.env.PORT is specified it'll not use this option - Default: 8080 - OPTIONAL
**/
module.exports = function (options) { return new APNRestServer(options); }
function APNRestServer(options) {
    APNRestServerInstance = this;
    //Check for required values on options
    if (!options) { assert.ok(false,"** APNRestServer ** options are not specified."); }
    else if (!options["clientSecretUser"] || options["clientSecretUser"].length == 0) { assert.ok(false,"** APNRestServer ** options 'clientSecretUser' is **REQUIRED**, but is not specified."); }
    else if (!options["serverSecretUser"] || options["serverSecretUser"].length == 0) { assert.ok(false,"** APNRestServer ** options 'serverSecretUser' is **REQUIRED**, but is not specified."); }
    else if (!options["commonSecretPass"] || options["commonSecretPass"].length == 0) { assert.ok(false,"** APNRestServer ** options 'commonSecretPass' is **REQUIRED**, but is not specified."); }
    else if (!options["metrics"] || options["metrics"].length == 0) { assert.ok(false,"** APNRestServer ** options 'metrics' is **REQUIRED**, but is not specified."); }
    else if (!options["database"] || options["database"].length == 0) { assert.ok(false,"** APNRestServer ** options 'database' is **REQUIRED**, but is not specified."); }
    
    //Get required values
    APNRestServerInstance.clientSecretUser = options["clientSecretUser"];
    APNRestServerInstance.serverSecretUser = options["serverSecretUser"];
    APNRestServerInstance.commonSecretPass = options["commonSecretPass"];
    APNRestServerInstance.metrics = require('tdmetrics')({projectID:options.metrics.projectID,auth:options.metrics.auth,host:options.metrics.host,port:options.metrics.port,path:options.metrics.path})
    APNRestServerInstance.database = options["database"];
    //Optional options
    APNRestServerInstance.serverPort = (process.env.PORT || options["serverPort"] || 8080);
    //Start Server
    APNRestServerInstance.startRestServer();
}

/* Public Functions */
APNRestServer.prototype.closeServer = function closeServer() {
  APNRestServerInstance.server.close(function () {
    console.log("Stopped");
  });
}
APNRestServer.prototype.startRestServer = function startRestServer() {
  APNRestServerInstance.server = server = restify.createServer({
    name:"APNRS"
  });
  //Server checks
  server.pre(function(req, res, next) {
    APNRestServerInstance.metrics.sendMetric("Status " + res.statusCode,res.statusCode,"Info",req.path,function (resp,ok) { if (!ok) console.log("TDMetrics not working properly",resp); });
    APNRestServerInstance.authenticateRequest(req,res,next);
  });
  //Router
  server.post('[a-zA-Z0-9-_~/\\.%]*', APNRestServerInstance.routeRequest);
  server.listen(APNRestServerInstance.serverPort , function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}

/* Private Util Functions */
APNRestServer.prototype.listenServerEvents = function listenServerEvents() {
  server.on("after",function (request, response, route) {
    console.log("after all");
  });
  server.on("uncaughtException",function (request, response, route, error) {
    console.log("exception-->> " + error.stack);
  });
}
APNRestServer.prototype.authenticateRequest = function authenticateRequest(req,res,next) {
  //Check
  if(!req.headers["authorization"]) { res.send(401,new Error("Unauthorized.")); }
  else { 
    //Try to parse auth
    var auth = new Buffer(req.headers["authorization"].replace("Basic ",""), 'base64').toString('ascii');
    auth = auth.split(':');
    if (auth.length >= 2) {
      req.username = auth[0], req.password = auth[1], auth = null;
      return next();
    }else { res.send(401,new Error("Unauthorized.")); return; }
  }
}

//Main Route
APNRestServer.prototype.routeRequest = function routeRequest(req, res, next) {
  //auth check 
  function isRequestAuthenticated(req,res,server) {
    if (req.username != (server ? APNRestServerInstance.serverSecretUser : APNRestServerInstance.clientSecretUser) || req.password != APNRestServerInstance.commonSecretPass) {
      if (server) res.send(403,new Error("Content-Type or Accept header does not specify supported types."));
      return false;
    }else { return true; }
  }
  
  /*Entities to be created
    //Devices
      //Tags (Many too Many relationship)
    //Requests
    //Push message
    //Feedback action
  */
  
  //Check for basic auth
  switch (req.path) {
    //Register/Update device informations
    //Method: POST
    //Body: base64("{ "token":"","tags":[""],"silent":{"startDate":"","endDate":"","timezone":"" }}")
    //Values:
        // 'token' - string - device token - REQUIRED
        // 'tags' - array(string) - Array of strings(Tags), this tag are created/removed on-demand - OPTIONAL - if not specified device will be dessacociated from that tag 
        // 'silent' - obj - Obj with revelevant informations for silent time - OPTIONAL - if not specified it will not be used
        // 'silent.startDate' - date - Start date of silent time for this device - REQUIRED
        // 'silent.endDate' - date - End date of silent time for this device - REQUIRED
        // 'silent.timezone' - string - timezone used on silent time date for this device - REQUIRED
    case "/register/": case "/register": {
      //Check 
      if(isRequestAuthenticated(req,res,false) || isRequestAuthenticated(req,res,true)){
        //DEBUG
//        res.send(200);
        //device create
        token = "token";
        tags = ["zoado","bom"];
        endDate = "endDate+";
        startDate = "startDate+";
        timeZone = "+3000";
        var currentDevice = device(APNRestServerInstance.database);
        currentDevice.APNDeviceRegister(token,tags,startDate,endDate,timeZone,function (okay,err) {
          console.log("sdedede");
          console.log(okay,err);
        });
      }
    }break;
    
    //Send push message
    //Method: POST
    //Body: base64("{ "tokens":[""],"tags":[""],"broadcast":true,"msg":{"badge":3,"alert":"alert message text","sound":"sound.aif"}}")
    //Values:
        // 'tokens' - array(string) - Array of strings(Tokens), this tokens are the devices token (can be used with tags) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
        // 'tags' - array(string) - Array of strings(Tags), this tags are shortcut for tokens (can be used with tokens) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
        // 'broadcast' - boolean - Indicates if is a broadcast message or not (will invalidate tags and tokens if true) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
        // 'msg' - obj - APN message object, if additionals values is needed place inside msg object to send - REQUIRED - since all childs are optional, this is required to remember that one child need to be inserted.
        // 'msg.alert' - string - alert to be displayed on push notifications message - OPTIONAL
        // 'msg.sound' - string - sound name to be played when push message arrive on device. - OPTIONAL - IMPORTANT default will use default sound. For silent message insert a invalid file sound string.
        // 'msg.bagde' - string|integer - Badge to be displayed, BUT you can use +5 do add into existing badge. 0 will remove badge if exists. - OPTIONAL
    case "/sendpush/": case "/sendpush": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //push sent
        //log push message
      }
    }break;
    //Stats of devices registered and unregistered with a range of time
    //Method: POST
    //Body: base64("{ "startDate":"","endDate":"" }")
    //Values:
        // 'startDate' - date - Start date of (un)register data points - REQUIRED
        // 'endDate' - date - End date of (un)register data points - REQUIRED
    case "/stats/devices": case "/stats/devices/": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //devices statistics
      }
    }break;
    //Stats of push messages sent with a range of time
    //Method: POST
    //Body: base64("{ "startDate":"","endDate":"" }")
    //Values:
        // 'startDate' - date - Start date of push data points - REQUIRED
        // 'endDate' - date - End date of push data points - REQUIRED
    case "/stats/push": case "/stats/push/": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //statistics of push messages sent
      }
    }break;
    //List of devices registered and unregistered with full details
    //Method: POST
        //Body: base64("{ "order":""}")
        //Values:
            // 'order' - typed - ASC/DSC - OPTIONAL - Default is ASC order by date
    //Obs: only 1000 entries will be dumped in one request, if more entries exists, an url with key "nextpage" with be present to indicate next page for more entries (next page will follow the same rule, showing only 1000 entries
    case "/list/devices/": case "/list/devices": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //list registered devices
      }
    }break;
    //List of tags used by devices (this tags are created and deleted on-demand)
    //Method: POST
        //Body: base64("{ "order":""}")
        //Values:
            // 'order' - typed - ASC/DSC - OPTIONAL - Default is ASC order by date
    //Obs: only 1000 entries will be dumped in one request, if more entries exists, an url with key "nextpage" with be present to indicate next page for more entries (next page will follow the same rule, showing only 1000 entries
    case "/list/tags/": case "/list/tags": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //list created tags
      }
    }break;
    //List of requests made into this server or group of servers
    //Method: POST
    //Body: base64("{ "order":""}")
    //Values:
        // 'order' - typed - ASC/DSC - OPTIONAL - Default is ASC order by date
    //Obs: only 1000 entries will be dumped in one request, if more entries exists, an url with key "nextpage" with be present to indicate next page for more entries (next page will follow the same rule, showing only 1000 entries).
    case "/list/request": case "/list/request/": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //list requests made into server
      }
    }break;
    //List of push messages sent by this server or group of servers
    //Method: POST
    //Body: base64("{ "order":""}")
    //Values:
        // 'order' - typed - ASC/DSC - OPTIONAL - Default is ASC order by date
    //Obs: only 1000 entries will be dumped in one request, if more entries exists, an url with key "nextpage" with be present to indicate next page for more entries (next page will follow the same rule, showing only 1000 entries
    case "/list/push": case "/list/push/": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //list push notifications message
      }
    }break;
    //List of feedback actions done this server or group of servers
    //Method: POST
    //Body: base64("{ "order":""}")
    //Values:
        // 'order' - typed - ASC/DSC - OPTIONAL - Default is ASC order by date
    //Obs: only 1000 entries will be dumped in one request, if more entries exists, an url with key "nextpage" with be present to indicate next page for more entries (next page will follow the same rule, showing only 1000 entries
    case "/list/feedback": case "/list/feedback/": {
      //Check 
      if(isRequestAuthenticated(req,res,true)){
        //DEBUG
        res.send(200);
        //list feedback actions done
      }
    }break;
    default: { 
      if(isRequestAuthenticated(req,res,true)){ res.send(404,new Error("Not route found.")); }
    } break;
  }
}