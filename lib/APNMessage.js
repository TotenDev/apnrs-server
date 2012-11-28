//
// APNMessage.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    deviceDB = require('./APNDeviceDB.js')();
/**
* Initialize APNDevice function
**/
module.exports = function (database,pushServer) { return new APNMessage(database,pushServer); }
function APNMessage(database,pushServer) { 
  this.databaseInformations = database;
  this.pushServer = pushServer;
}
/**
* Prepare && Send Message function 
* @param Function callback - function callback - REQUIRED
**/
APNDevice.prototype.APNMessagePrepareAndSend = function APNMessagePrepareAndSend(msg_alert,msg_sound,msg_badge,msg_broadcasting,msg_tags,mag_tokens,callback) {
  var tokens = [];
  if (msg_broadcasting) { /*if is broadcasting fetch all tokens*/
  }else if (msg_tags && msg_tags.length) { /*if contains tags, get all tokens associated with that tokens*/
  
  
  
    if (token && token.length == 0) { callback(false,'tag(s) is(are) invalid'); return; }
  }else { /* check if recieved tokens are valid*/
    token = msg_tokens;
    //check if all tokens are valid
    
    //
    if (token && token.length == 0) { callback(false,'no tokens on body'); return; }
  }
  
  //Checks
  if (msg_sound && msg_sound.length > 45) { callback(false,'sound is too big'); return; }
  
  //check if badge contains '+' or '-' signs, if make badge operations based on actual badge
  
  //Build message
  var message = require('node_apns').Notification("abcdefghabcdefgh", {foo: "bar", aps:{"alert":"Hello world!", "sound":"default"}});  
  //Check if message is valid
  if (message && message.isValid()) { this.APNMessageSend(message); }
  else { callback(false,'notification is not valid'); return; }
}
/**
* Send Message function 
* @param Function callback - function callback - REQUIRED
**/
APNDevice.prototype.APNMessageSend = function APNMessageSend(notification,callback) {
    //Async
      //push sent
      //write push message
}