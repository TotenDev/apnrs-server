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
    APNDeviceDatabaseMysqlKey = "apnrs_devices",
    APNTagsDatabaseMysqlKey = "apnrs_tags",
    APNDeviceTagsDatabaseMysqlKey = "apnrs_devices_tags"
function currentUnixTimestamp() { return Math.round(new Date().getTime()/1000); }
/**
* Initialize APNDevice function
**/
module.exports = function (database) { return new APNDevice(database); }
function APNDevice(database) { 
  this.databaseInformations = database;
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
    this.APNDeviceCreateUpdate(1,token,tags,startDateGMTString,endDateGMTString,0,callback);/*Create/Update device into DB*/
}












/*Private*/
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
* Create or Update device into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCreateUpdate = function APNDeviceCreateUpdate(active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var responsed = false;
  var instance = this;
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    //Connected
    if (!responsed) {
      var strQuery = util.format('INSERT INTO %s (active,token,silentStartGMT,silentEndGMT,deviceBadge) VALUES (%s,\'%s\',\'%s\',\'%s\',%s) ON DUPLICATE KEY UPDATE active=%s,token=\'%s\',silentStartGMT=\'%s\',silentEndGMT=\'%s\',deviceBadge=%s ',APNDeviceDatabaseMysqlKey,active,token,startDateGMT,endDateGMT,deviceBadge,active,token,startDateGMT,endDateGMT,deviceBadge);
      //Insert Device
      var query = connection.query(strQuery, function(err, result) {
        if ((!err || err == null) && result.insertId != undefined) { 
          var deviceID = result.insertId;
          //Create tags
          console.log("creating");
          instance.APNDeviceCreateUpdateTags(tags,function (err,respID) {
            if (err) {
              console.log("cleaning");
              //Clean Tags already associated with that device
              instance.APNDeviceCleanTagsOfDevice(deviceID,function (err,response) {
                if (err) {
                  //Associate tags
                  instance.APNDeviceAssociateDeviceWithTag(deviceID,respID,function (err,resp) {
                    if (!err) { callback(true,resp); }
                    else { callback(false,'query error '+resp); }
                  });
                  //Clean unused tags
                  instance.APNDeviceCleanUnusedTags(function (okay,resp2) {})
                }else { callback(false,'query error '+response); }
              });
            } else { callback(false,'query error '+respID); }
          });
        } else { callback(false,'query error2 '+result+err); }
      });
    } },function (err) {
      //Cannot connect
      if (!responsed) { callback(false,'internal database error '+ err); }
    });
} 
/**
* Create or Update tag into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCreateUpdateTags = function APNDeviceCreateUpdateTags(tags,callback) {
  var current = 0, lenght = tags.length;
  for (tag in tags) {
    var responsed = false,
        current = 0;
    //create database connection for creating
    this.defaultDatabaseConnection(function (connection) {
      //Connected
      if (!responsed) {
        var strQuery = util.format('INSERT INTO %s (tag) VALUES (\'%s\') ON DUPLICATE KEY UPDATE tag=\'%s\'',APNTagsDatabaseMysqlKey,tag);
        var query = connection.query(strQuery, function(err, result) {
          current = current+1;
          if (lenght == current) {
            if ((!err || err == null) && result.insertId != undefined) { callback(true,result.insertId); }
            else { callback(false,'query error '+err); } 
          }
        });
      } },function (err) {
      //Cannot connect
      if (!responsed && lenght == current) { callback(false,'internal database error '+ err); }
    });
  }
}  
/**
* Associate Device with Tag in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceAssociateDeviceWithTag = function APNDeviceAssociateDeviceWithTag(deviceID,tagID,callback) {
  var responsed = false;
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    //Connected
    if (!responsed) {
    var strQuery = util.format('INSERT INTO %s (deviceID,tagID) VALUES (%s,%s) ON DUPLICATE KEY UPDATE deviceID=%s,tagID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID,tagID,deviceID,tagID);
      var query = connection.query(strQuery, function(err, result) {
        if ((!err || err == null) && result.insertId != undefined) { callback(true,result.insertId); }
        else { callback(false,'query error '+err); }
      });
    } },function (err) {
    //Cannot connect
    if (!responsed) { callback(false,'internal database error '+ err); }
  });
} 
/**
* Clean Tags by device in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCleanTagsOfDevice = function APNDeviceCleanTagsOfDevice(deviceID,callback) {
  var responsed = false;
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    //Connected
    if (!responsed) {
    var strQuery = util.format('DELETE FROM %s WHERE deviceID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID);
    console.log("query" , strQuery);
      var query = connection.query(strQuery, function(err, result) {
        if (!err || err == null) { callback(true,null); }
        else { callback(false,'query error '+err); }
      });
    } },function (err) {
    //Cannot connect
    if (!responsed) { callback(false,'internal database error '+ err); }
  });
}
/*
* Clean not used Tags in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCleanUnusedTags = function APNDeviceCleanUnusedTags(callback) {
  var responsed = false;
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    //Connected
    if (!responsed) {
    var strQuery = util.format('DELETE FROM %s WHERE NOT EXISTS ( SELECT * from %s )',APNTagsDatabaseMysqlKey,APNDeviceTagsDatabaseMysqlKey);
    console.log("query" , strQuery);
      var query = connection.query(strQuery, function(err, result) {
        if (!err || err == null) { callback(true,null); }
        else { callback(false,'query error '+err); }
      });
    } },function (err) {
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