//
// devices.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var mysqlConnector = require('mysql');
/**
* Initialize APNDevice function
**/
module.exports = function () { return new APNDevice(initializationFunction,args,database); }
function APNDevice(_initializationFunction,_args,database) { 
  databaseInformations = database;
  _initizalitionFunction.apply(_initializationFunction,_args); 
}
//Database util
function defaultDatabaseConnection(successCb,errorCB) {
  var connection = mysql.createConnection(databaseInformations);
  var errorCount = 0;
  function handleDisconnect(connection) {
    connection.on('error', function(err) {
      errorCount++;
      if (errorCount >= 3) {
        connection.destroy();       
        errorCB();
      }else {
       console.log('Re-connecting lost connection: ' + err.stack); 
        connection = mysql.createConnection(databaseInformations);
        handleDisconnect(connection);
        connection.connect();
      }
    });
  }
  handleDisconnect(connection);
  var connectionTimeout = setTimeout(function () { connection.destroy(); },1000);
  connection.connect(function(err) {
    successCb(connection);
    clearTimeout(connectionTimeout);
  });
}
/**
* Try to Initialize APNDevice with ID
* @param String deviceID - device id (this will be checked, because this token is unique on system) - REQUIRED
**/
APNDevice.prototype.APNDeviceWithID(deviceID) = function APNDeviceWithID(deviceID) {
 //create database connection 
 defaultDatabaseConnection(function (connection) {
   //Connected
  
 },function () {
  //Cannot connect
  
 });
}
/**
* Try to Initialize APNDevice with token
* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
**/
APNDevice.prototype.APNDeviceWithToken(token) = function APNDeviceWithToken(token) {
}
/**
* Register APNDevice function
* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
* @param Array tags - tags associated with this device - REQUIRED
* @param Date startDate - tags associated with this device - REQUIRED
* @param Date endDate - tags associated with this device - REQUIRED
* @param timeZone timeZone - tags associated with this device - REQUIRED
**/
APNDevice.prototype.APNDeviceRegister(token,tags,startDate,endDate,timeZone) = function APNDeviceRegister(token,tags,startDate,endDate,timeZone) {
    //Check for required values on options
    if (!token) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
    else if (!tags || tags.length == 0) { assert.ok(false,"** APNDevice ** tags is **REQUIRED** ,but is not specified."); }
    else if (!startDate) { assert.ok(false,"** APNDevice ** startDate is **REQUIRED** ,but is not specified."); }
    else if (!endDate) { assert.ok(false,"** APNDevice ** endDate is **REQUIRED** ,but is not specified."); }
    else if (!timeZone) { assert.ok(false,"** APNDevice ** timeZone is **REQUIRED** ,but is not specified."); }
    //
//    var device = APNDeviceWithToken(token); //Try to get device by token, if exists with this ID, we will not create a new one
//    if (!device) { device = APNDeviceCreate(id,active,token,tags,startDate,endDate,timeZone,deviceBadge,lastRegistrationDate);/*Create new device into DB*/ }
//    return device;
}
/**
* Main Initialization Function (this will save the device into the database)
* Initialize APNDevice with informations
* @param all paramateres are required
**/
function APNDeviceFill(id,active,token,tags,startDate,endDate,timeZone,deviceBadge,lastRegistrationDate) {
  
}   