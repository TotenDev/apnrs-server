//
// APNPushServer.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//
var apnsModule = require('node_apns');

/**
* Initialize APNPushServer function
**/
module.exports = function (pushServerOptions,errorCB) { return new APNPushServer(pushServerOptions,errorCB); }
function APNPushServer(pushServerOptions,errorCB) { 
  var instance = this;
  this.pushServer = apnsModule.Push(pushServerOptions);
  this.respondError = function (err) {
    if (errorCB) { errorCB(err); errorCB = null; }
  }
  //Callbacks
  this.pushServer.on('notificationError', function (errorCode, uid) {
    console.log('**Push Server** Notification with uid', uid, 'triggered an error:', apnsModule.definitions.APNS.errors[errorCode]);
  });
  this.pushServer.on('error', function (error) { 
    console.log("**Push Server** error:",error); 
    instance.respondError(error); 
  });
  this.pushServer.once('end', function () { console.log("**Push Server** ended"); });
  this.pushServer.on('sent', function (notification) { console.log('**Push Server** Notification sent', notification); });
}
APNPushServer.prototype.disconnect = function disconnect() { this.pushServer.disconnect(); }
APNPushServer.prototype.sendMessage = function sendMessage(token,payload,callback) { 
  var message = apnsModule.Notification(token,payload);
  if (message && message.isValid()) {
    this.pushServer.sendNotification(notification,function (notification) {  callback(notification);  });
  }else { callback(null); }
}