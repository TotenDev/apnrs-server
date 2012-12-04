//
// APNFeedbackQueryWrapper.js — APNRSqueries
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    queries = require('./APNQueries.js')(),
    definitions = require('./definitions.js')();
/**
* Initialize APNFeedbackQueryWrapper function
**/
module.exports = function (databaseOptions) { return new APNFeedbackQueryWrapper(databaseOptions); }
function APNFeedbackQueryWrapper(databaseOptions) { 
  this.databaseInformations = databaseOptions;
}
/**
* Create feedback entry and unregister device
* @param String token - device token sent by apple response - REQUIRED
* @param String|Integer msgTimestamp - when push notification message was sent and not delivered by an error - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNFeedbackQueryWrapper.prototype.APNFeedbackLogAndUnregister = function APNFeedbackLogAndUnregister(token,msgTimestamp,callback) {
  //create database connection
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //Create or Update device in database
    queries.createFeedbackEntry(connection,token,msgTimestamp,function (statu,resp) {
      if (status && resp) { 
        queries.unregisterDevice(connection,token,function (queryStatus,deviceID) {
          if (queryStatus && deviceID) { 
            callback(definitions.retValSuccess,'');
            queries.logRegisterDevice(connection,deviceID,0,function (leStatus,response2) { connection.end(); });
          } else { definitions.dieQueryError(connection,callback,deviceID); }
        });
      } else { definitions.dieQueryError(connection,callback,resp); }
    });
  },callback);
}
/** 
* List Feedback entries
* String order - order of this list (ASC|DSC) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNFeedbackQueryWrapper.prototype.APNFeedbackListOnDB = function APNFeedbackListOnDB(order,callback) {
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list feedback entries
    queries.listFeedback(connection,order,function (status,resp) {
      definitions.respondQueryCallback(connection,callback,status,resp);
    });
  },callback);
}