//
// devices.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var mysqlConnector = require('mysql'),
    assert = require('assert'),
    util = require('util');
//Definitions
var APNDeviceIDMysqlKey = "deviceID",
    APNDeviceTokenMysqlKey = "token",
    APNDeviceDatabaseMysqlKey = "apnrs_devices";
function currentUnixTimestamp() { return Math.round(new Date().getTime()/1000); }
/**
* Initialize APNDevice function
**/
module.exports = function (database) { return new APNDevice(database); }
function APNDevice(database) { 
  this.databaseInformations = database;
}
//Database util
APNDevice.prototype.defaultDatabaseConnection = function defaultDatabaseConnection(successCb,errorCb) {
  var mysqlOptions = this.databaseInformations;
  var connection = mysqlConnector.createConnection(mysqlOptions);
  var errorCount = 0;
  function handleDisconnect(connection) {
    connection.on('error', function(err) {
      errorCount++;
      if (errorCount >= 3) {
        connection.destroy();
      }else {
        console.log('re-connecting lost mysql connection: '+err.stack); 
        connection = mysqlConnector.createConnection(mysqlOptions);
        handleDisconnect(connection);
        var connectionTimeout = setTimeout(function () { connection.destroy(); },10000);
        connection.connect(function(err) {
          if (err) console.log(err);
          clearTimeout(connectionTimeout);
        });
      }
    });
  }
  handleDisconnect(connection);
  var connectionTimeout = setTimeout(function () { connection.destroy(); },1000);
  connection.connect(function(err) {
    if (err) { console.log(err); errorCb(err); }
    else { successCb(connection); }
    clearTimeout(connectionTimeout);
  });
}
/**
* Fill device by ID
* @param String deviceID - device id (this will be checked, because this token is unique on system) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
* 
**/
APNDevice.prototype.fillByID = function fillByID(deviceID,callback) { 
  //Check for required values
  if (!deviceID) { assert.ok(false,"** APNDevice ** deviceID is **REQUIRED** ,but is not specified."); }
  this.getObjetctInDB(deviceID,APNDeviceIDMysqlKey,callback); 
}
/**
* Fill device by Token
* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
**/
APNDevice.prototype.fillByToken = function fillByToken(token) { 
  //Check for required values
  if (!token) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
  this.getObjetctInDB(token,APNDeviceTokenMysqlKey,callback); 
}
/**
* Register APNDevice function
* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
* @param Array tags - tags associated with this device - REQUIRED
* @param Date startDate - tags associated with this device - REQUIRED
* @param Date endDate - tags associated with this device - REQUIRED
* @param timeZone timeZone - tags associated with this device - REQUIRED
* @param Function callback - function callback - REQUIRED
**/
APNDevice.prototype.APNDeviceRegister = function APNDeviceRegister(token,tags,startDate,endDate,timeZone,callback) {
    //Check for required values
    if (!token) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
    else if (!tags || tags.length == 0) { assert.ok(false,"** APNDevice ** tags is **REQUIRED** ,but is not specified."); }
    else if (!startDate) { assert.ok(false,"** APNDevice ** startDate is **REQUIRED** ,but is not specified."); }
    else if (!endDate) { assert.ok(false,"** APNDevice ** endDate is **REQUIRED** ,but is not specified."); }
    else if (!timeZone) { assert.ok(false,"** APNDevice ** timeZone is **REQUIRED** ,but is not specified."); }
    //format date
    var now = new Date(Date.now());
    //
    startDate = now.getMonth()+1  + '/' +  now.getDate() + '/' + now.getFullYear() + ' ' + startDate + ' ' + timeZone;
    var startDateGMT = new Date(startDate);
    var startDateGMTString = startDateGMT.getUTCHours()+":"+startDateGMT.getUTCMinutes()+":00";
    //
    endDate = now.getMonth()+1  + '/' +  now.getDate() + '/' + now.getFullYear() + ' ' + endDate + ' ' + timeZone;
    var endDateGMT = new Date(endDate);
    var endDateGMTString = endDateGMT.getUTCHours()+":"+endDateGMT.getUTCMinutes()+":00";
    //try to insert into device
    var device = this.APNDeviceCreateUpdate(1,token,tags,startDateGMTString,endDateGMTString,0,callback);/*Create/Update device into DB*/
}

/*Private*/
/**
* Create or Update device into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCreateUpdate = function APNDeviceCreateUpdate(active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var responsed = false;
 //create database connection for creating
 this.defaultDatabaseConnection(function (connection) {
   //Connected
   if (!responsed) {
    var strQuery = util.format('INSERT INTO %s (active,token,silentStartGMT,silentEndGMT,deviceBadge) VALUES (%s,\'%s\',\'%s\',\'%s\',%s) ON DUPLICATE KEY UPDATE active=%s,token=\'%s\',silentStartGMT=\'%s\',silentEndGMT=\'%s\',deviceBadge=%s ',APNDeviceDatabaseMysqlKey,active,token,startDateGMT,endDateGMT,deviceBadge,active,token,startDateGMT,endDateGMT,deviceBadge);
    console.log("query" , strQuery);
    var query = connection.query(strQuery, function(err, result) {
      if (!err && result.insertId) {
        console.log('query result: ', result);
        console.log("inserted id",result.insertId); 
      }else { callback(false,'query error '+err); }
    });
   }
  },function (err) {
  //Cannot connect
  if (!responsed) { callback(false,'internal database error '+ err); }
 });
}   
/**
* Get object in DB and fill object
* @param String value - value to be searched by key - REQUIRED
* @param String key - key to be match the value - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
* 
**/
APNDevice.prototype.getObjetctInDB = function getObjetctInDB(deviceID,callback) {
 var responded = false;
 //create database connection 
 this.defaultDatabaseConnection(function (connection) {
  //Connected
  if (!responded) {
    
  }
 },function (err) {
  //Cannot connect
  if (!responded) { callback(true,'internal database error ', err); }
 });
}