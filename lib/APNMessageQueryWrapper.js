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
  this.databaseInformations = database;
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
    //list devuces on db 
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
    //list devuces on db 
    queries.listActiveDevicesWithTags(connection,tags,function (queryStatus,devices) {
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
APNMessageQueryWrapper.prototype.APNMessageTokenIsValid = function APNMessageTokenIsValid(token,callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    queries.getDeviceByToken(connection,token,function (queryStatus,resp) {
      if (queryStatus) {  callback(true,resp); }
      else { callback(false,'query error '+resp); }
      connection.end();
    });
  },function (err) { callback(false,err); });
}