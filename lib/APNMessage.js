//
// APNMessage.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var functionQueue = require("function-queue"),
    preparationQueue = functionQueue(),
    messagesQueue = functionQueue(),
    pushServer = require('./APNPushServer.js'),
    messageStoreWrapper = require('./APNMessageQueryWrapper.js');
    
/**
* Initialize APNMessage function
**/
module.exports = function (databaseOptions,pushServerOptions) { return new APNMessage(databaseOptions,pushServerOptions); }
function APNMessage(databaseOptions,pushServerOptions) { 
  this.databaseWrapper = messageStoreWrapper(databaseOptions);
  this.pushServerOptions = pushServerOptions;
}
/**
* Prepare && Send Message function 
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessagePrepareAndSend = function APNMessagePrepareAndSend(msg_alert,msg_sound,msg_badge,msg_broadcasting,msg_tags,msg_tokens,callback) {
  //Checks
  if (msg_sound && msg_sound.length > 45) { callback(false,'sound is too big'); return; }
  //Auxs
  var devices = [],
      isntance = this,
      msg = {alert:msg_alert,sound:msg_sound,badge:msg_badge};
  //STEP: get tokens 
  preparationQueue.push(function (nextStep) {
    /*if is broadcasting fetch all tokens*/ 
    if (msg_broadcasting) {
      isntance.databaseWrapper.APNMessageListActiveDevicesOnDB(function (status,resp) {
        if (status) { devices = resp; nextStep(); }
        else { callback(false,'error in listing devices for broadcast message --',resp); return; }
      });
    }
    /*if contains tags, get all tokens associated with that tokens*/
    else if (msg_tags && msg_tags.length > 0) { 
      //Fetch devices with that tags ( no validation of tokens are needed because we trust on query :) )
      isntance.databaseWrapper.APNMessageListActiveDevicesWithTagsOnDB(msg_tags,function (status,resp) {
        if (status) { devices = resp; nextStep(); }
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
          isntance.databaseWrapper.APNMessageTokenIsValid(msg_tokens[token],function (status,resp) {
            completed += 1;
            if (status) { devices.push(resp); }
            //check if reached the end
            if (completed == devices.length) {
              if (devices && devices.length == 0) { callback(false,'all tokens are invalid'); return; }
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
  });

  //STEP: Check if message is valid and send it
  preparationQueue.push(function (nextStep) {
    isntance.APNMessageSend(tokens,msg,callback);
    nextStep();
  });  
}
/**
* Send Message function 
* @param Array(string) devices - array with string of devices - REQUIRED
* @param Obj msg - object message as '{alert:'I love cake',sound:'cake.aif',badge:'+2'}'  - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageSend = function APNMessageSend(devices,msg,callback) {
  //Start push server
  var server = pushServer(this.pushServerOptions,function connected() {
    var sentCount = 0;
    //Async (for each device)
    for (device in devices) {
      messagesQueue.push(function (nextDevice,currentDevice) {
        //calculate badge (contains '+' or '-' signs, if make badge operations based on actual badge)
        if (msg['badge'].match(/^[+]{1}[0-9]{1,}/)) {
          var currentDeviceBadge = currentDevice['deviceBadge'];
          var msgBadgeForOperation = msg['badge'].replace(/^[-+]{1}/g, "");
          if (msg['badge'].match(/^[+]{1}[0-9]{1,}/)) { currentDeviceBadge += msgBadgeForOperation; }
          else { currentDeviceBadge -= msgBadgeForOperation ; }
          msg['badge'] = currentDeviceBadge;
        }else {
          if (msg['badge'].match(/^[0-9]{1,}$/)) { /* all good, we just need to keep on*/ }
          else { callback(false,'badge is invalid'); return; }
        }
        
        //check if message isValid for this device
        var message = require('node_apns').Notification("tokenTest", {aps:msg});  
        if (message && message.isValid()) { 
//          this.APNMessageSend(tokens,msg); nextStep(); 
          //write push message on db
          //push sent
          //close server with 'this.pushServer.close();' when all message is sent
        }
        else { callback(false,'notification is not valid'); return; }
      },devices[device]);
    }
  },function error(err) {
    
  });
}