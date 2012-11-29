//
// APNMessage.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    deviceDB = require('./APNDeviceDB.js')(),
    preparationQueue = require("function-queue")(),
    pushModule = require('node_apns');
/**
* Initialize APNDevice function
**/
module.exports = function (database,pushServerOptions) { return new APNMessage(database,pushServerOptions); }
function APNMessage(database,pushServerOptions) { 
  this.databaseInformations = database;
  this.pushServerOptions = pushServerOptions;
}
/**
* Prepare && Send Message function 
* @param Function callback - function callback - REQUIRED
**/
APNMessage.prototype.APNMessagePrepareAndSend = function APNMessagePrepareAndSend(msg_alert,msg_sound,msg_badge,msg_broadcasting,msg_tags,msg_tokens,callback) {
  //Checks
  if (msg_sound && msg_sound.length > 45) { callback(false,'sound is too big'); return; }
  //Auxs
  var tokens = [],
      isntance = this,
      msg = {alert:msg_alert,sound:msg_sound,badge:msg_badge};
  
  //STEP: get tokens 
  preparationQueue.push(function (nextStep) {
    /*if is broadcasting fetch all tokens*/ 
    if (msg_broadcasting) {
      isntance.APNMessageListActiveDevicesOnDB(function (status,resp) {
        if (status) { tokens = resp; nextStep(); }
        else { callback(false,'error in listing devices for broadcast message --',resp); return; }
      });
    }
    /*if contains tags, get all tokens associated with that tokens*/
    else if (msg_tags && msg_tags.length > 0) { 
      //Fetch devices with that tags ( no validation of tokens are needed because we trust on query :) )
      isntance.APNMessageListActiveDevicesWithTagsOnDB(msg_tags,function (status,resp) {
        if (status) { tokens = resp; nextStep(); }
        else { callback(false,'error in listing devices with tags `' + tags + '` --',resp); return; }
      });
    }
    /* check if recieved tokens are valid */
    else {
      if (msg_tokens && msg_tokens.length == 0) { callback(false,'no tokens on body'); return; }
      else {
        var completed = 0,
            successeds = 0;
        for (token in msg_tokens) {
          isntance.APNMessageTokenIsValid(msg_tokens[token],function (status,resp) {
            completed += 1;
            if (status) { tokens.push(resp); }
            //check if reached the end
            if (completed == tokens.length) {
              if (tokens && tokens.length == 0) { callback(false,'all tokens are invalid'); return; }
              else { nextStep(); }
            }
          });
        }
      }
    }
  });
  
  //STEP: filter devices with silent time
  preparationQueue.push(function (nextStep) {
    var oldTokens = tokens ,
        now = new Date() ;
    tokens = [];
    //Set UTC time
    now.setHours(now.getUTCHours());
    now.setMinutes(now.getUTCMinutes());
    //
    for (token in oldTokens) {
      var startDate = Date.parse(oldTokens[token]['silentStartGMT']),
          endDate = Date.parse(oldTokens[token]['silentEndGMT']);  
      //Set year, month and day as current
      startDate.setFullYear(now.getFullYear()); startDate.setMonth(now.getMonth()); startDate.setDate(now.getDate());
      endDate.setFullYear(now.getFullYear()); endDate.setMonth(now.getMonth()); endDate.setDate(now.getDate());
      //if now is bigger than startDate
      if (now > startDate && now < endDate) { tokens.push(token); }
    }
    //
    if (tokens && tokens.length == 0) { callback(false,'all tokens are in silent time now'); return; }
    else { nextStep(); }
  };

  //STEP: Check if message is valid and send it
  preparationQueue.push(function (nextStep) {
    isntance.APNMessageSend(tokens,msg);
    nextStep();
  };  
}
/**
* Send Message function 
* @param Function callback - function callback - REQUIRED
**/
APNMessage.prototype.APNMessageSend = function APNMessageSend(notification,callback) {
  //Start push server
  var instance = this;
  this.pushServer = pushModule.Push(this.pushServerOptions);
  //Push Server events
  this.pushServer.on('sent', function (notification) {
      // The notification has been sent to the socket (it may be buffered if the network is slow...)
      console.log('Sent', notification);
  });
  this.pushServer.on('notificationError', function (errorCode, uid) {
      // Apple has returned an error:
      console.log('Notification with uid', uid, 'triggered an error:', require('node_apns').APNS.errors[errorCode]);
      //write push message on db with status errored
  });
  this.pushServer.on('error', function (error) {  console.log('push notification server error:', error);  });
    //Async (for each device)
      //calculate badge (contains '+' or '-' signs, if make badge operations based on actual badge)
      //check if message if valid for this device
  //      var message = require('node_apns').Notification("tokenTest", {aps:msg});  
  //      if (message && message.isValid()) {  this.APNMessageSend(tokens,msg);  }
  //      else { callback(false,'notification is not valid'); return; }
  //      nextStep();
      //write push message on db with status sending
      //push sent
      //write push message on db with status sent
      //close server with 'this.pushServer.close();' when all message is sent
}





/** 
* List Active Devices from database
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageListActiveDevicesOnDB = function APNMessageListActiveDevicesOnDB(callback) {
  //create database connection for listing
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    deviceDB.listActiveDevices(connection,'ASC',function (queryStatus,devices) {
      if (queryStatus) {  callback(true,devices); }
      else { callback(false,'query error '+devices); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}
/** 
* List Active Devices from database with tags associated with
* @param Array(string) tags - array of tag names (aka.strings) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageListActiveDevicesWithTagsOnDB = function APNMessageListActiveDevicesWithTagsOnDB(tags,callback) {
  //create database connection for listing
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    deviceDB.listActiveDevicesWithTags(connection,tags,function (queryStatus,devices) {
      if (queryStatus) {  callback(true,devices); }
      else { callback(false,'query error '+devices); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}
/** 
* Check if device token is valid
* @param String token - array of tag names (aka.strings) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageTokenIsValid = function APNMessageTokenIsValid(token,callback) {
  //create database connection for listing
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    deviceDB.getDeviceByToken(connection,token,function (queryStatus,resp) {
      if (queryStatus) {  callback(true,resp); }
      else { callback(false,'query error '+resp); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}