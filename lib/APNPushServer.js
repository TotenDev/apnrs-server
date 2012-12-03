//
// APNPushServer.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//
var pushModule = require('node_apns'),
    hash = require('hash');
    
//How 'hash' works
//myHash.set('__proto__', 'value')
//myHash.get('__proto__') // 'value'
//myHash.has('constructor') // false
//myHash.del('a')

/**
* Initialize APNPushServer function
**/
module.exports = function (pushServerOptions) { return new APNPushServer(pushServerOptions); }
function APNPushServer(pushServerOptions,connectedCB,errorCB) { 
  this.messageQueue = new hash();
  this.pushServer = pushModule.Push(pushServerOptions);
  var instance = this;
  //Messaging
  this.pushServer.on('sent', function (notification) {
    this.messageQueue.set(this.pushServer.uid,notification);
    console.log('Sent', notification);
  });
  this.pushServer.on('notificationError', function (errorCode, uid) {
    // Apple has returned an error:
    console.log('Notification with uid', uid, 'triggered an error:', require('node_apns').APNS.errors[errorCode]);
    //Get message and resend
    var message = this.messageQueue.get(uid);
    //remove message since this will be re-added into queue
    this.messageQueue.del(uid);
    //queue notification to be send again :)
    instance.queueMessage(message);
  });
  //Connected event
  this.pushServer.on('authorized', function (notification) {
    if (connectedCB) {
      connectedCB();
      errorCB = null; 
    }
  });
  //Error Event
  this.pushServer.on('error', function (error) {  
    if (errorCB) {
      errorCB(error);
      connectedCB = null; 
    }
  });
}

APNPushServer.prototype.queueMessage = function queueMessage(notification) { this.pushServer.sendNotification(notification); }