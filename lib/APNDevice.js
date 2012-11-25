//
// devices.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var mysqlConnector = require('mysql'),
    assert = require('assert'),
    util = require('util'),
    sqlTagsQueue = require("function-queue")();
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
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    console.log("fillByID is not implemented");
    dsdsds;
    //fetch
    instance.getObjetctInDB(connection,'id',deviceID,APNDeviceDatabaseMysqlKey,function (okay,responseSelect) {
      if (okay) { callback(true,null); }
      else { callback(false,result); }
      connection.end();
    });
  },function (err) { callback(true,err); });
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
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    console.log("fillByToken is not implemented");
    dsdsds;
    //fetch
    instance.getObjetctInDB(connection,'token','\''+token+'\'',APNDeviceDatabaseMysqlKey,function (okay,responseSelect) {
      if (okay) { callback(true,null); }
      else { callback(false,result); }
      connection.end();
    });
  },function (err) { callback(true,err); });
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
    if (!token || token.length == 0) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
    else if (!tags) { assert.ok(false,"** APNDevice ** tags is **REQUIRED** ,but is not specified."); }
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
    this.APNDeviceRegisterOnDB(1,token,tags,startDateGMTString,endDateGMTString,0,callback);/*Create/Update device into DB*/
}












/*Private*/
/**
* Create or Update device into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceRegisterOnDB = function APNDeviceRegisterOnDB(active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var instance = this;
  //create database connection for creating
  this.defaultDatabaseConnection(function (connection) {
    //Create or Update device in datbase
    instance.APNDeviceCreateUpdate(connection,active,token,tags,startDateGMT,endDateGMT,deviceBadge,function (queryStatus,deviceID) {
      if (queryStatus) { 
        //Create tags in database
        instance.APNDeviceCreateUpdateTags(connection,tags,function (queryStatus,respID) {
          if (queryStatus) {
            //Clean Tags associated with that device
            instance.APNDeviceCleanTagsOfDevice(connection,deviceID,function (queryStatus,response) {
              if (queryStatus) {
                //Associate tags with device
                instance.APNDeviceAssociateDeviceWithTag(connection,deviceID,respID,function (queryStatus,resp) {
                  if (queryStatus) { callback(true,'OK'); }
                  else { callback(false,'query error '+resp); }
                  //Clean unused tags
                  instance.APNDeviceCleanUnusedTags(connection,function(queryStatus,response2) { connection.end(); })
                });
              }else { callback(false,'query error '+response); connection.end(); }
            });
          } else { callback(false,'query error '+respID); connection.end(); }
        });
      } else { callback(false,'query error '+deviceID+queryStatus); connection.end(); }
    });
  },function (err) { callback(false,err); });
} 




/*Private Database functions*/
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
    if (err) { console.log(err); errorCb('Error in connecting to mysql database: '+err); }
    else { successCb(connection); }
    clearTimeout(connectionTimeout);
  });
}
/**
* Create or Update device into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCreateUpdate = function APNDeviceCreateUpdate(connection,active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var strQuery = util.format('INSERT INTO %s (active,token,silentStartGMT,silentEndGMT,deviceBadge) VALUES (%s,\'%s\',\'%s\',\'%s\',%s) ON DUPLICATE KEY UPDATE active=%s,token=\'%s\',silentStartGMT=\'%s\',silentEndGMT=\'%s\',deviceBadge=%s ',APNDeviceDatabaseMysqlKey,active,token,startDateGMT,endDateGMT,deviceBadge,active,token,startDateGMT,endDateGMT,deviceBadge);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getObjetctInDB(connection,'token','\''+token+'\'',APNDeviceDatabaseMysqlKey,function (okay,responseSelect) {
          if (okay) { callback(true,instance.dbDevice['id']); }
          else { callback(false,result); }
        });
      }else { callback(true,result.insertId); }
    } 
    else { callback(false,result); }
  });
} 
/**
* Create or Update tag into database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCreateUpdateTags = function APNDeviceCreateUpdateTags(connection,tags,callback) {
  var current = 0, 
      lenght = (tags ? tags.length : 0),
      ids = [],
      instance = this;
  for (tag in tags) {
    sqlTagsQueue.push(function (nextTag) {
      var strQuery = util.format('INSERT INTO %s (tag) VALUES (\'%s\') ON DUPLICATE KEY UPDATE tag=\'%s\'',APNTagsDatabaseMysqlKey,tags[tag],tags[tag]);
        var query = connection.query(strQuery, function(err, result) { 
          current = current+1;
          if ((!err || err == null) && result.insertId != undefined) { 
            //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
            if (result.insertId == 0) {
              instance.getObjetctInDB(connection,'tag','\''+tags[current-1]+'\'',APNTagsDatabaseMysqlKey,function (okay,responseSelect) {
                if (okay) /* Fetched tag */ { 
                  ids.push(instance.dbDevice['id']);
                  if (lenght == current) { callback(true,ids); }
                  nextTag();
                } 
                else /* Error in fetching existing tag */ { 
                  if (lenght == current) { callback(false,responseSelect); } 
                  nextTag(); 
                }
              });
            } else /* Inserted new tag */ { 
              ids.push(result.insertId);
              if (lenght == current) { callback(true,ids); }
              nextTag();
            }
          } else /* Errored in inserting new tag */ { 
            if (lenght == current) { callback(false,err); }
            nextTag();
          }
        });
    });
  }
  if (!tags || tags.length==0) { callback(true,null); }
}  
/**
* Associate Device with Tag in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceAssociateDeviceWithTag = function APNDeviceAssociateDeviceWithTag(connection,deviceID,tagIDs,callback) {
  var current = 0, lenght = (tagIDs ? tagIDs.length : 0);
  for (tagID in tagIDs) {
    var strQuery = util.format('INSERT INTO %s (deviceID,tagID) VALUES (%s,%s) ON DUPLICATE KEY UPDATE deviceID=%s,tagID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID,tagIDs[tagID],deviceID,tagID);
    var query = connection.query(strQuery, function(err, result) { 
      current = current+1;
      if ((!err || err == null) && result.insertId != undefined) { 
        if (lenght == current) { callback(true,null); }
      } else if (lenght == current) { callback(false,err); }
    });
  }
  if (!tagIDs || tagIDs.length==0) { callback(true,null); }
} 
/**
* Clean Tags by device in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCleanTagsOfDevice = function APNDeviceCleanTagsOfDevice(connection,deviceID,callback) {
  if (deviceID) {
   var strQuery = util.format('DELETE FROM %s WHERE deviceID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID);
    var query = connection.query(strQuery, function(err, result) {
        if (!err || err == null) { callback(true,null); }
        else { callback(false,err); }
    }); 
  }else { callback(true,null); }
}
/*
* Clean not used Tags in database
* @param all paramateres are required
**/
APNDevice.prototype.APNDeviceCleanUnusedTags = function APNDeviceCleanUnusedTags(connection,callback) {
  var strQuery = util.format('DELETE a FROM %s a WHERE a.id NOT IN ( SELECT b.tagID FROM %s b )',APNTagsDatabaseMysqlKey,APNDeviceTagsDatabaseMysqlKey);
  var query = connection.query(strQuery, function(err, result) {
    if (!err || err == null) { callback(true,null); }
    else { callback(false,err); }
  });
}    
/**
* Get object in DB and fill object
* @param ConnectionObj connection - mysql connection object create by 'defaultDatabaseConnection' function - REQUIRED
* @param String value - value to be searched by key - REQUIRED
* @param String key - key to be match the value - REQUIRED
* @param String database - database name to be used in querys - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
* 
**/
APNDevice.prototype.getObjetctInDB = function getObjetctInDB(connection,key,value,database,callback) {
 //create database connection 
 var instance = this;
 this.defaultDatabaseConnection(function (connection) {
  var strQuery = util.format('SELECT * FROM %s WHERE %s=%s',database,key,value);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result[0]) { instance.dbDevice = result[0]; callback(true,null); }
    else { callback(false,err); }
  });
 },function (err) { callback(true,err); });
}