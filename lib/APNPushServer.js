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
  this.pushServer = apnsModule.Push(pushServerOptions);
  var instance = this;
  this.respondError = function (err) {
    if (errorCB) { errorCB(err); errorCB = null; }
  }
  this.pushServer.on('notificationError', function (errorCode, uid) {
    console.log('Notification with uid', uid, 'triggered an error:', apnsModule.definitions.APNS.errors[errorCode]);
  });
  this.pushServer.once('error', function (error) { instance.respondError(error); });
  this.pushServer.once('end', function () {  console.log("Push server ended");  });
  this.pushServer.on('sent', function (notification) { console.log('Notification sent', notification); });
}

APNPushServer.prototype.sendMessage = function sendMessage(token,payload,callback) { 
  var message = apnsModule.Notification(token,payload);
  if (message && message.isValid()) {
    this.pushServer.sendNotification(notification,function (notification) {  callback(notification);  });
  }else { callback(null); }
}