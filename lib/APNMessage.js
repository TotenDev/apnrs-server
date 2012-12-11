//
// APNMessage.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var functionQueue = require("function-queue"),
    pushServer = require('./APNPushServer.js'),
    messageStoreWrapper = require('./APNMessageQueryWrapper.js'),
    definitions = require('./definitions.js')();
/**
* Initialize APNMessage function
**/
module.exports = function (databaseOptions,pushServerOptions) { return new APNMessage(databaseOptions,pushServerOptions); }
function APNMessage(databaseOptions,pushServerOptions) { 
  this.databaseWrapper = messageStoreWrapper(databaseOptions);
  this.pushServerOptions = pushServerOptions;
  //
  preparationQueue = functionQueue();
  messagesQueue = functionQueue();
}


/**
* List Push Notifications function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageList = function APNMessageList(bodyData,callback) {
  //list push notifications message
  if (bodyData && bodyData['order'] && bodyData['order'].length == 3) {
    var order = bodyData['order'];
    if (order == 'DSC' || order == 'ASC') { this.databaseWrapper.APNMessageListOnDB(order,callback);/*List messages in DB*/ }
    else { callback(definitions.retValAccept,"order value is invalid :("); }
  }else { callback(definitions.retValAccept,"order key is missing :("); }
}
/**
* List Push Notification Datapoints function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageListPushDataPoints = function APNMessageListPushDataPoints(bodyData,callback) {
  //device create
  if (bodyData && bodyData['startDate'] && bodyData['startDate'].length > 0 && 
                  bodyData['endDate'] && bodyData['endDate'].length > 0) {
    var startDate = bodyData['startDate'], 
        endDate = bodyData['endDate'];
    //make sure date is in correct format and it's on GMT
    var startDateGMT = new Date(startDate);
    var endDateGMT = new Date(endDate);
    if (startDateGMT == 'Invalid Date' || endDateGMT == 'Invalid Date') { callback(definitions.retValAccept,'start or end date is invalid'); }
    else {
      var startDateGMTString = startDateGMT.getUTCFullYear()  + '-' +  twoCharString(startDateGMT.getUTCMonth()+1) + '-' + twoCharString(startDateGMT.getUTCDate()) + ' ' + twoCharString(startDateGMT.getUTCHours())+":" + twoCharString(startDateGMT.getUTCMinutes()) + ":" + twoCharString(startDateGMT.getUTCSeconds());
      var endDateGMTString = endDateGMT.getUTCFullYear()  + '-' +  twoCharString(endDateGMT.getUTCMonth()+1) + '-' + twoCharString(endDateGMT.getUTCDate()) + ' ' + twoCharString(endDateGMT.getUTCHours()) + ":" + twoCharString(endDateGMT.getUTCMinutes()) + ":" + twoCharString(endDateGMT.getUTCSeconds());
      //
      this.databaseWrapper.APNMessageListPushNotificationsDataPointsOnDB(startDateGMTString,endDateGMTString,callback); 
    }
  }else { callback(definitions.retValAccept,"token key is missing :("); }
}

/**
* Parse && Prepare && Send Message function 
* @param Obj bodyData - body data received by POST request - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageParse = function APNMessageParse(bodyData,callback) {
  var msg_alert, //'msg.alert' - string - alert to be displayed on push notifications message - OPTIONAL
      msg_sound, //'msg.sound' - string - sound name to be played when push message arrive on device. - OPTIONAL - IMPORTANT default will use default sound. For silent message insert a invalid file sound string.
      msg_badge, //'msg.bagde' - string|integer - Badge to be displayed, BUT you can use +5 do add into existing badge. 0 will remove badge if exists. - OPTIONAL
      msg_broadcasting, //'broadcast' boolean - Indicates if is a broadcast message or not (will invalidate tags and tokens if true) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
      msg_tags, //'tags' array(string) - Array of strings(Tags), this tags are shortcut for tokens (can be used with tokens) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
      msg_tokens; //'tokens' array(string) - Array of strings(Tokens), this tokens are the devices token (can be used with tags) - OPTIONAL (one of 'tokes','tags' or 'broadcast' got be used)
  //alert
  if (bodyData['msg'] && bodyData['msg']['alert'] && bodyData['msg']['alert'].length > 0) { msg_alert = bodyData['msg']['alert']; }
  else { msg_alert = ''; /*Defaults*/ }
  //sound
  if (bodyData['msg'] && bodyData['msg']['sound'] && bodyData['msg']['sound'].length > 0) { msg_sound = bodyData['msg']['sound']; }
  else { msg_sound = ''; /*Defaults*/ }
  //badge
  if (bodyData['msg'] && bodyData['msg']['badge'] && bodyData['msg']['badge'].length > 0) { msg_badge = bodyData['msg']['badge']; }
  else { msg_badge = ''; /*Defaults*/ }
  //is broadcast or not
  if (bodyData['broadcast'] && bodyData['broadcast'].length > 0) { msg_broadcasting = bodyData['broadcast']; }
  else { msg_broadcasting = ''; /*Defaults*/ }
  //tags
  if (bodyData['tags'] && bodyData['tags'].length > 0) { msg_tags = bodyData['tags']; }
  else { msg_tags = ''; /*Defaults*/ }
  //devices
  if (bodyData['tokens'] && bodyData['tokens'].length > 0) { msg_tokens = bodyData['tokens']; }
  else { msg_tokens = ''; /*Defaults*/ }
  //prepare and send notification
  this.APNMessagePrepare(msg_alert,msg_sound,msg_badge,msg_broadcasting,msg_tags,msg_tokens,callback);
}




/*  Private  */
/**
* Prepare && Send Message function 
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessagePrepare = function APNMessagePrepare(msg_alert,msg_sound,msg_badge,msg_broadcasting,msg_tags,msg_tokens,callback) {
  //Checks
  if (msg_sound && msg_sound.length > 45) { callback(definitions.retValAccept,'sound is too big'); return; }
  //Auxs
  var devices = [],
      instance = this,
      msg = {alert:msg_alert,sound:msg_sound,badge:msg_badge},
      broadcasting = false;
  //STEP: get tokens 
  preparationQueue.push(function (nextStep) {
    /*if is broadcasting fetch all tokens*/ 
    if (msg_broadcasting) {
      instance.databaseWrapper.APNMessageListActiveDevicesOnDB(function (status,resp) {
        if (status) { devices = resp; nextStep(); }
        else { callback(definitions.retValError,'error in listing devices for broadcast message --',resp); return; }
      });
    }
    /*if contains tags, get all tokens associated with that tokens*/
    else if (msg_tags && msg_tags.length > 0) { 
      //Fetch devices with that tags ( no validation of tokens are needed because we trust on query :) )
      instance.databaseWrapper.APNMessageListActiveDevicesWithTagsOnDB(msg_tags,function (status,resp) {
        if (status) { devices = resp; nextStep(); }
        else { callback(definitions.retValError,'error in listing devices with tags `' + tags + '` --',resp); return; }
      });
    }
    /* check if recieved tokens are valid */
    else {
      if (!msg_tokens || msg_tokens.length == 0) { callback(definitions.retValAccept,'no tokens on body'); return; }
      else {
        var completed = 0,
            successeds = 0;
        for (token in msg_tokens) {
          instance.databaseWrapper.APNMessageTokenIsValid(msg_tokens[token],function (status,resp) {
            completed += 1;
            if (status) { devices.push(resp); }
            //check if reached the end
            if (completed == msg_tokens.length) {
              if (!devices || devices.length == 0) { callback(definitions.retValError,'all tokens are invalid'); return; }
              else { nextStep(); }
            }
          });
        }
      }
    }
  });
  
  //STEP: filter devices with silent time
  preparationQueue.push(function (nextStep) {
    var oldTokens = devices ,
        now = new Date() ;
    tokens = [],
    silentTokens = [];
    //Set UTC time
    now.setHours(now.getUTCHours());
    now.setMinutes(now.getUTCMinutes());
    //for all tokens we check if is out of silentTime
    for (token in oldTokens) {
      var startDate = Date.parse(oldTokens[token]['silentStartGMT']),
          endDate = Date.parse(oldTokens[token]['silentEndGMT']);  
          if (!(startDate instanceof Date)) { startDate = new Date(); }
          if (!(endDate instanceof Date)) { endDate = new Date(); }
      //Set year, month and day as current
      startDate.setFullYear(now.getFullYear()); startDate.setMonth(now.getMonth()); startDate.setDate(now.getDate());
      endDate.setFullYear(now.getFullYear()); endDate.setMonth(now.getMonth()); endDate.setDate(now.getDate());
      //if now is bigger than startDate
      if (now > startDate && now < endDate) { tokens.push(token); }
      else { silentTokens.push(token); }
    }
    nextStep();
  });

  //STEP: Check if message is valid and send it
  preparationQueue.push(function (nextStep) {
    //Devices out of silent time now
    instance.APNMessageSend(tokens,msg,{'broadcasting':broadcasting,'tags':msg_tags},function (status,resp) {
      if (status == definitions.retValSuccess) {
        //Devices in silent time
        silentMsg = msg;
        silentMsg['sound'] = "";
        instance.APNMessageSend(silentTokens,silentMsg,{'broadcasting':broadcasting,'tags':msg_tags},callback);
      }else { callback(status,resp); }
    });
    nextStep();
  });  
}
/**
* Send Message function 
* @param Array(string) devices - array with string of devices - REQUIRED
* @param Obj msg - object message as '{alert:'I love cake',sound:'cake.aif',badge:'+2'}'  - REQUIRED
* @param Obj info - object info with '{broadcasting:0,tags:['io-io',"punks"]}'  - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessage.prototype.APNMessageSend = function APNMessageSend(devices,msg,info,callback) {
  //check
  if (devices.length == 0) {
    callback(definitions.retValSuccess,"all sent");
    return;
  }
  
  //Start push server
  var server = pushServer(this.pushServerOptions,function error(err) { console.log("Push server error",err); }),
      instance = this;
  //Async (for each device)
  var sentCount = 0;
  for (device in devices) {
    messagesQueue.push(function (nextDevice,currentDevice) {
      //Disconnection from apns when last msg is sent
      sentCount++;
      var disconnectIfCan = function () {
        if (sentCount == devices.length) {
          server.disconnect();
        } nextDevice();
      }
      
      //calculate badge (if contains '+' or '-' signs, make badge operations based on actual badge)
      if (msg['badge'] && msg['badge'].length > 0) {
       if (msg['badge'].match(/^[+]{1}[0-9]{1,}/)) {
          var currentDeviceBadge = currentDevice['deviceBadge'];
          var msgBadgeForOperation = msg['badge'].replace(/^[-+]{1}/g, "");
          if (msg['badge'].match(/^[+]{1}[0-9]{1,}/)) { currentDeviceBadge += msgBadgeForOperation; }
          else { currentDeviceBadge -= msgBadgeForOperation ; }
          msg['badge'] = currentDeviceBadge;
        }else {
          if (msg['badge'].match(/^[0-9]{1,}$/)) { /* all good, we just need to keep on*/ }
          else { 
            callback(definitions.retValError,'badge is invalid'); 
            nextDevice();
           }
        }  
      }
      //Add into db (with status as `sending`)
      instance.databaseWrapper.APNMessageCreateLog(msg,info["broadcasting"],info["tags"],currentDevice['deviceToken'],function (status,resp) {
        if (status == definitions.retValSuccess) {
          var logID = resp;
          if (logID) {
            //send message to apple push servers
            server.sendMessage(currentDevice['deviceToken'],{aps:msg},function (notification) {
              if (notification) { 
                //set status as sent and call callback
                instance.databaseWrapper.APNMessageUpdateLogStatus(logID,'sent',function (status,resp) { 
                  if (sentCount == devices.length) { callback(definitions.retValSuccess,"all sent"); } 
                  disconnectIfCan();
                 }); 
              }else { 
                callback(definitions.retValError,'error when sending message to apple push servers'); 
                //set status as errored
                instance.databaseWrapper.APNMessageUpdateLogStatus(logID,'errored (APNS error)',function (status,resp) { disconnectIfCan(); });
              }
            });
          }else { 
            callback(definitions.retValError,'invalid message ID on database --',resp); 
            disconnectIfCan();
          }
        }else { 
          callback(status,resp); 
          disconnectIfCan();
        }
      });
    },devices[device]);
  }
}