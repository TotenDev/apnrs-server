//
// APNFeedbackServer.js — APNRS
// today is 12/04/12, it is now 06:05 PM
// created by Thierry Passeron
// see LICENSE for details.
//
  
var node_apns = require("node_apns"),
    feedbackWrapper = require("./APNFeedbackQueryWrapper.js"),
    definitions = require('./definitions.js')();
    
/**
* Initialize APNDevice function
**/
module.exports = function (databaseOptions,pushOptions) { return new APNFeedbackServer(databaseOptions,pushOptions); }
function APNFeedbackServer(databaseOptions,pushOptions) {
  shouldTerminate = false;
  server_instance = null;
  this.pushOptions = pushOptions; 
  this.databaseWrapper = feedbackWrapper(databaseOptions);
  //connect
  this.connect();
}
/**
* List Feedback function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNFeedbackServer.prototype.APNFeedbackList = function APNFeedbackList(bodyData,callback) {
  //list feedback entries
  if (bodyData && bodyData['order'] && bodyData['order'].length == 3) {
    var order = bodyData['order'];
    if (order == 'DSC' || order == 'ASC') { this.databaseWrapper.APNFeedbackListOnDB(order,callback);/*List messages in DB*/ }
    else { callback(definitions.retValAccept,"order value is invalid :("); }
  }else { callback(definitions.retValAccept,"order key is missing :("); }
}
/* Private */
APNFeedbackServer.prototype.connect = function connect() {
  var instance = this;
   //disconnect server if already exists
  if (server_instance) { server_instance.disconnect(); }
  //
  server_instance = node_apns.Feedback(this.pushOptions);
  server_instance.on('device', function(time, token) {
      console.log('**Feedback Server** Token', token, "is not responding since", new Date(time * 1000));
      instance.databaseWrapper.APNFeedbackLogAndUnregister(token,(time * 1000),function (status,resp) { 
        console.log("**Feedback Server** [DEBUG] feedback server response ("+status+"-"+resp+")"); 
      });
  });
  server_instance.on('connected', function () {  console.log('**Feedback Server** connected!');  });
  server_instance.on('error', function (err) { 
      console.log('**Feedback Server** Server errored ',err);
      console.log('**Feedback Server** Server will terminate');
  });
  server_instance.on('end', function () { 
      console.log('**Feedback Server** Done!'); 
      if (!shouldTerminate) { console.log("**Feedback Server** Restarting server in 2 secs"); }
      setTimeout(function () {  
        if (!shouldTerminate) { instance.connect();   }
      },2000);
  });
}
APNFeedbackServer.prototype.disconnect = function disconnect() {
  shouldTerminate = true;
  if (server_instance) { server_instance.disconnect(); } 
}