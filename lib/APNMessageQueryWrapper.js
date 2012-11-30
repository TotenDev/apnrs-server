//
// APNMessageQueryWrapper.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    queries = require('./APNQueries.js')();
/**
* Initialize APNMessageQueryWrapper function
**/
module.exports = function (databaseOptions) { return new APNMessageQueryWrapper(databaseOptions); }
function APNMessageQueryWrapper(databaseOptions,pushServerOptions) { 
  this.databaseInformations = databaseOptions;
}
/** 
* List Active Devices from database
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessageQueryWrapper.prototype.APNMessageListActiveDevicesOnDB = function APNMessageListActiveDevicesOnDB(callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list active devices on db 
    queries.listActiveDevices(connection,'ASC',function (queryStatus,devices) {
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
APNMessageQueryWrapper.prototype.APNMessageListActiveDevicesWithTagsOnDB = function APNMessageListActiveDevicesWithTagsOnDB(tags,callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list active devices associated with tags on db 
    queries.listActiveDevicesWithTags(connection,tags,function (queryStatus,devices) {
      if (queryStatus) {  callback(true,devices); }
      else { callback(false,'query error '+devices); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}
/** 
* Check if device token is valid on database
* @param String token - array of tag names (aka.strings) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessageQueryWrapper.prototype.APNMessageTokenIsValid = function APNMessageTokenIsValid(token,callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //get device on db by token
    queries.getDeviceByToken(connection,token,function (queryStatus,resp) {
      if (queryStatus) {  callback(true,resp); }
      else { callback(false,'query error '+resp); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}
/** 
* Insert Push Message with initial status on database
* @param String msg_alert - message alert to be displayed - REQUIRED
* @param String msg_sound - message sounde to be played - REQUIRED
* @param Integer msg_badge - message badge to be displayed in your app icon - REQUIRED
* @param Boolean isBroadcasting - flag if this message is a result of a broadcast message - REQUIRED
* @param Array tags -  if message is send by tags it'll be displayed - REQUIRED
* @param String deviceToken -  device token - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNMessageQueryWrapper.prototype.APNMessageCreateLog = function APNMessageCreateLog(msg_alert,msg_sound,msg_badge,isBroadcasting,tags,deviceToken,sentDate,callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //crate push notifications log on db
    queries.createPushMessageLog(connection,msg_alert,msg_sound,msg_badge,isBroadcasting,tags,deviceToken,sentDate,function (queryStatus,resp) {
      if (queryStatus) {  callback(true,resp); }
      else { callback(false,'query error '+resp); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}