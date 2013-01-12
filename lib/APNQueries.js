//
// APNQueries.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//
var mysqlConnector = require('mysql'),
    util = require('util'),
    functionQueue = require("function-queue"),
    definitions = require('./definitions.js')();
//Definitions
var APNDeviceDatabaseMysqlKey = "apnrs_devices",
    APNTagsDatabaseMysqlKey = "apnrs_tags",
    APNDeviceTagsDatabaseMysqlKey = "apnrs_devices_tags",
    APNDeviceRegisterDatabaseMysqlKey = "apnrs_devices_register",
    APNPushMessagesDatabaseMysqlKey = "apnrs_messages",
    APNFeedbackDatabaseMysqlKey = "apnrs_feedback";
//
module.exports = function () { return new APNQueries(); }
function APNQueries() { sqlTagsQueue = functionQueue(); }





/**
* Create feedback entry
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String token - device token sent by apple response - REQUIRED
* @param String|Integer msgTimestamp - when push notification message was sent and not delivered by an error - REQUIRED
* @param String callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createFeedbackEntry = function createFeedbackEntry(connection,token,msgTimestamp,callback) {
  var strQuery = util.format('INSERT INTO %s (token,msgTimestamp) VALUES (\'%s\',%s) ',APNFeedbackDatabaseMysqlKey,token,msgTimestamp);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes were necessary and it really exists on DB)
      if (result.insertId == 0) { callback(definitions.retValError,result); }
      else { callback(definitions.retValSuccess,result.insertId); }
    } 
    else { callback(definitions.retValError,result); }
  });
}
/**
* List Feedback in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the notifications (createDate) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listFeedback = function listFeedback(connection,order,callback) {
  var strQuery = util.format('SELECT `token`,`msgTimestamp` FROM `%s` ORDER BY `createDate` %s ',APNFeedbackDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
}





/**
* Create Message Push Log
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String msg - message obj with badge,sound and alert - REQUIRED
* @param Boolean isBroadcasting - flag if this message is a result of a broadcast message - REQUIRED
* @param Array tags -  if message is send by tags it'll be displayed - REQUIRED
* @param String deviceToken -  device token - REQUIRED
* @param String callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createPushMessageLog = function createPushMessageLog(connection,msg,isBroadcasting,tags,deviceToken,status,callback) {
  var strQuery = util.format('INSERT INTO %s (msg_alert,msg_sound,msg_badge,isBroadcasting,tags,token,status) VALUES (\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\') ',APNPushMessagesDatabaseMysqlKey,msg["alert"],msg["sound"],msg["sound"],isBroadcasting,tags,deviceToken,status);
  //Insert Push Notification Message
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes were necessary and it really exists on DB)
      if (result.insertId == 0) { callback(definitions.retValError,result); }
      else { callback(definitions.retValSuccess,result.insertId); }
    } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* Update Message Push Log Status
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String logID - log id return by 'createPushMessageLog' function' - REQUIRED
* @param String status - message status - REQUIRED
* @param String callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.updatePushMessageLogStatus = function updatePushMessageLogStatus(connection,logID,status,callback) {
  var strQuery = util.format('UPDATE %s SET status=\'%s\' WHERE id=%s',APNPushMessagesDatabaseMysqlKey,status,logID);
  //Insert Push Notification Message
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes were necessary and it really exists on DB)
      if (result.insertId == 0) { callback(definitions.retValError,result); }
      else if (result.insertId == logID) { callback(definitions.retValSuccess,result.insertId); }
      else { callback(definitions.retValError,'FATAL ERROR in updating push message status on DB'); }
    } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* List Push Notifications in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the notifications (sentDate) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.listPushNotificationsMessage = function listPushNotificationsMessage(connection,order,callback) {
  var strQuery = util.format('SELECT `msg_alert`,`msg_sound`,`msg_badge`,`isBroadcasting`,`tags`,`token`,`status` FROM `%s` WHERE 1  ORDER BY `sentDate` %s',APNPushMessagesDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if (!err || err == null) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
} 
/**
* List Push Notifications Datapoints in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Date startDate - date to start datapoints of registering and unregistering
* @param Date endDate - date to end datapoints of registering and unregistering
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listPushNotificationDatapoints = function listPushNotificationDatapoints(connection,startDate,endDate,callback) {
  var strQuery = util.format('SELECT `msg_alert`,`msg_sound`,`msg_badge`,`isBroadcasting`,`tags`,`token`,`status` FROM `%s` WHERE `sentDate` BETWEEN \'%s\' AND \'%s\' ',APNPushMessagesDatabaseMysqlKey,startDate,endDate);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
} 





/**
* Create or Update device into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createUpdateDevices = function createUpdateDevices(connection,active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var strQuery = util.format('INSERT INTO %s (active,token,silentStartGMT,silentEndGMT,badge) VALUES (%s,\'%s\',\'%s\',\'%s\',%s) ON DUPLICATE KEY UPDATE active=%s,token=\'%s\',silentStartGMT=\'%s\',silentEndGMT=\'%s\',badge=%s,lastRegisterDate=now() ',APNDeviceDatabaseMysqlKey,active,token,startDateGMT,endDateGMT,deviceBadge,active,token,startDateGMT,endDateGMT,deviceBadge);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getDeviceByToken(connection,token,function (okay,responseSelect) {
          if (okay == definitions.retValSuccess) { callback(definitions.retValSuccess,responseSelect['id']); }
          else { callback(okay,result); }
        });
      }else { callback(definitions.retValSuccess,result.insertId); }
    } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* Unregister(update) device into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String token - device token - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.unregisterDevice = function unregisterDevice(connection,token,callback) {
  var strQuery = util.format('UPDATE %s SET active=0 WHERE token=\'%s\'',APNDeviceDatabaseMysqlKey,token);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes were necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getDeviceByToken(connection,'\''+token+'\'',function (okay,responseSelect) {
          if (okay == definitions.retValSuccess) { callback(definitions.retValSuccess,responseSelect['id']); }
          else { callback(okay,result); }
        });
      }else { callback(definitions.retValSuccess,result.insertId); }
    } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* Update device badge
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String token - device token - REQUIRED
* @param String badge - device badge - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.updateDeviceBadge = function updateDeviceBadge(connection,token,badge,callback) {
  var strQuery = util.format('UPDATE %s SET badge=%s WHERE token=\'%s\'',APNDeviceDatabaseMysqlKey,badge,token);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes were necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getDeviceByToken(connection,'\''+token+'\'',function (okay,responseSelect) {
          if (okay == definitions.retValSuccess) { callback(definitions.retValSuccess,responseSelect['id']); }
          else { callback(okay,result); }
        });
      }else { callback(definitions.retValSuccess,result.insertId); }
    } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* Get object in DB and fill object
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String value - value to be searched by key - REQUIRED
* @param String key - key to be match the value - REQUIRED
* @param String database - database name to be used in querys - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string when convinient.
* 
**/
APNQueries.prototype.getObjetctInDB = function getObjetctInDB(connection,key,value,database,callback) {
  var strQuery = util.format('SELECT * FROM %s WHERE %s="%s"',database,key,value);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result[0]) { callback(definitions.retValSuccess,result[0]); }
    else { callback(definitions.retValError,result); }
  });
}
/**
* Get device by token in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String token - device token to be searched - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string when convinient.
* 
**/
APNQueries.prototype.getDeviceByToken = function getDeviceByToken(connection,token,callback) {
  this.getObjetctInDB(connection,'token',token,APNDeviceDatabaseMysqlKey,callback);
}
/**
* List Devices in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the devices (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listDevices = function listDevices(connection,order,callback) {
  var strQuery = util.format('SELECT `active`,`token`,`silentStartGMT`,`silentEndGMT`,`badge`,`lastRegisterDate` FROM `%s` ORDER BY `lastRegisterDate` %s ',APNDeviceDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
}
/**
* List Active Devices in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the devices (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listActiveDevices = function listActiveDevices(connection,order,callback) {
  var strQuery = util.format('SELECT `active`,`token`,`silentStartGMT`,`silentEndGMT`,`badge`,`lastRegisterDate` FROM `%s` WHERE `active`=1 ORDER BY `lastRegisterDate` %s ',APNDeviceDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
}
/**
* List Active Devices With tags associated with DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Array(string) tags - tags name that devices must have - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listActiveDevicesWithTags = function listActiveDevicesWithTags(connection,tags,callback) {
  var instance = this;
  //Fetch tags with that name
  this.listFullTagsByName(connection,'ASC',tags,function (err,tagsID) {
    if (err == definitions.retValSuccess && tagsID && tagsID.length > 0) {
      instance.associatedDevicesWithTagsID(connection,tagsID,function (err2,devicesID) {
        if (err2 == definitions.retValSuccess) {
          //if is not array 
          if (devicesID.length == undefined) {
            var tmp = devicesID;
            devicesID = []; devicesID.push(tmp);
          }
          ///
          if (devicesID && devicesID.length > 0) {
            //Get device for WHERE clause
            var deviceQuery = '';
            for (device in devicesID) {
              if (deviceQuery.length > 0) { deviceQuery += (' OR `id`='+devicesID[device]['deviceID']); }
              else { deviceQuery += ('`id`='+devicesID[device]['deviceID']); }
            }
            //
            var strQuery = util.format('SELECT * FROM %s WHERE %s',APNDeviceDatabaseMysqlKey,deviceQuery);
            var query = connection.query(strQuery, function(err3, result) {
              if ((!err3 || err3 == null) && result[0]) { callback(definitions.retValSuccess,result); }
              else { callback(definitions.retValError,result); }
            });
          }else { callback(definitions.retValAccept,'no devices found with respective tags ** '+tags); }
        }else { callback(err2,devicesID); }
      });
    }else { callback(definitions.retValAccept,'no tags found with respective names ** '+tags); }
  });
}  
/**
* Log Device register call
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Integer deviceID - device ID on database that registered - REQUIRED
* @param Integer registering - if device is registering (true) or unregistering (false) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.logRegisterDevice = function logRegisterDevice(connection,deviceID,registering,callback) {
  var strQuery = util.format('INSERT INTO %s (deviceID,registering) VALUES (%s,%s)',APNDeviceRegisterDatabaseMysqlKey,deviceID,registering);
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { callback(definitions.retValSuccess,result.insertId); } 
    else { callback(definitions.retValError,result); }
  });
} 
/**
* List Register Datapoints in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Date startDate - date to start datapoints of registering and unregistering
* @param Date endDate - date to end datapoints of registering and unregistering
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listDeviceRegisterCalls = function listDeviceRegisterCalls(connection,startDate,endDate,callback) {
  var strQuery = util.format('SELECT `deviceID`,`registering`,`createDate` FROM `%s` WHERE `createDate` BETWEEN \'%s\' AND \'%s\' ',APNDeviceRegisterDatabaseMysqlKey,startDate,endDate);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
} 





/**
* Create or Update tag into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Array tags - array of string to create tags with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createUpdateTags = function createUpdateTags(connection,tags,callback) {
  var current = 0, 
      lenght = (tags ? tags.length : 0),
      ids = [],
      instance = this;
  if (!tags || tags.length==0) { callback(definitions.retValAccept,null); return; }
  for (tag in tags) {
    sqlTagsQueue.push(function (nextTag) {
      var strQuery = util.format('INSERT INTO %s (tag) VALUES (\'%s\') ON DUPLICATE KEY UPDATE tag=\'%s\'',APNTagsDatabaseMysqlKey,tags[tag],tags[tag]);
        var query = connection.query(strQuery, function(err, result) { 
          current = current+1;
          if ((!err || err == null) && result.insertId != undefined) { 
            //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
            if (result.insertId == 0) {
              instance.getObjetctInDB(connection,'tag',tags[current-1],APNTagsDatabaseMysqlKey,function (okay,responseSelect) {
                if (okay == definitions.retValSuccess) /* Fetched tag */ { 
                  ids.push(responseSelect['id']);
                  if (lenght == current) { callback(definitions.retValSuccess,ids); }
                  nextTag();
                }else /* Error in fetching existing tag */ { 
                  if (lenght == current) { callback(okay,responseSelect); } 
                  nextTag(); 
                } 
              });
            } else /* Inserted new tag */ { 
              ids.push(result.insertId);
              if (lenght == current) { callback(definitions.retValSuccess,ids); }
              nextTag();
            }
          } else /* Errored in inserting new tag */ { 
            if (lenght == current) { callback(definitions.retValError,result); }
            nextTag();
          }
        });
    });
  }
}  
/**
* Associate Device with Tag in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String deviceID - device ID on database to associated tags with - REQUIRED
* @param String tagIDs - tags ID on database to associated the device with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.associateDeviceWithTag = function associateDeviceWithTag(connection,deviceID,tagIDs,callback) {
  var current = 0, lenght = (tagIDs ? tagIDs.length : 0);
  if (!tagIDs || tagIDs.length==0) { callback(definitions.retValSuccess,null); return; }
  for (tagID in tagIDs) {
    var strQuery = util.format('INSERT INTO %s (deviceID,tagID) VALUES (%s,%s) ON DUPLICATE KEY UPDATE deviceID=%s,tagID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID,tagIDs[tagID],deviceID,tagID);
    var query = connection.query(strQuery, function(err, result) { 
      current = current+1;
      if ((!err || err == null) && result.insertId != undefined) { 
        if (lenght == current) { callback(definitions.retValSuccess,null); }
      } else if (lenght == current) { callback(definitions.retValError,result); }
    });
  }
} 
/**
* Associated Devices with Tags ID in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String tagIDs - tags ID on database to associated the device with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.associatedDevicesWithTagsID = function associatedDevicesWithTagsID(connection,tagIDs,callback) {
  //Get tags WHERE clause
  var tagsQuery = '';
  for (tag in tagIDs) {
    if (tagsQuery.length > 0) { tagsQuery += (' OR `tagID`='+tagIDs[tag]['id']); }
    else { tagsQuery += ('`tagID`='+tagIDs[tag]['id']); }
  }
  if (!tagIDs || tagIDs.length==0) { callback(definitions.retValAccept,null); return; }
  //
  var strQuery = util.format('SELECT * FROM %s WHERE %s',APNDeviceTagsDatabaseMysqlKey,tagsQuery);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result[0]) { callback(definitions.retValSuccess,result[0]); }
    else { callback(definitions.retValError,result); }
  });
} 
/**
* Clean Tags by device in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String deviceID - device ID on database to clean that tags associated with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.cleanTagsOfDevice = function cleanTagsOfDevice(connection,deviceID,callback) {
  if (deviceID) {
   var strQuery = util.format('DELETE FROM %s WHERE deviceID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID);
    var query = connection.query(strQuery, function(err, result) {
        if (!err || err == null) { callback(definitions.retValSuccess,null); }
        else { callback(definitions.retValError,result); }
    }); 
  }else { callback(true,definitions.retValAccept); }
}
/*
* Clean not used Tags in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.cleanUnusedTags = function cleanUnusedTags(connection,callback) {
  var strQuery = util.format('DELETE a FROM %s a WHERE a.id NOT IN ( SELECT b.tagID FROM %s b )',APNTagsDatabaseMysqlKey,APNDeviceTagsDatabaseMysqlKey);
  var query = connection.query(strQuery, function(err, result) {
    if (!err || err == null) { callback(definitions.retValSuccess,null); }
    else { callback(definitions.retValError,result); }
  });
}    
/**
* List Tags in DB (Full Mode)
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the tags (resgitration order) - REQUIRED
* @param Array(string) tags - tags name to be fetched
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listFullTagsByName = function listFullTagsByName(connection,order,tags,callback) {
  //Get tags WHERE clause
  var tagsQuery = '';
  for (tag in tags) {
    if (tagsQuery.length > 0) { tagsQuery += (' OR `tag`=\''+tags[tag]+"\'"); }
    else { tagsQuery += ('`tag`=\''+tags[tag]+"\'"); }
  }
  //
  var strQuery = util.format('SELECT * FROM `%s` WHERE %s ORDER BY `createDate` %s ',APNTagsDatabaseMysqlKey,tagsQuery,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
}   
/**
* List Tags in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the tags (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.status - if errored == definitions.retValError.
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listTags = function listTags(connection,order,callback) {
  var strQuery = util.format('SELECT `tag`,`createDate` FROM `%s` ORDER BY `createDate` %s ',APNTagsDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(definitions.retValSuccess,result); }
    else { callback(definitions.retValError,result); }
  });
} 





/*Private Database functions*/
APNQueries.prototype.defaultDatabaseConnection = function defaultDatabaseConnection(databaseInfo,successCb,errorCb) {
  var mysqlOptions = databaseInfo;
  var connection = mysqlConnector.createConnection(mysqlOptions);
  var errorCount = 0;
  function handleDisconnect(connection) {
    connection.on('error', function(err) {
      errorCount++;
      if (errorCount >= 3) { connection.destroy(); }
      else {
        console.log("**Query**",'re-connecting lost mysql connection: '+err.stack); 
        connection = mysqlConnector.createConnection(mysqlOptions);
        handleDisconnect(connection);
        var connectionTimeout = setTimeout(function () { connection.destroy(); },10000);
        connection.connect(function(err) {
          if (err) console.log("**Query**",err);
          clearTimeout(connectionTimeout);
        });
      }
    });
  }
  handleDisconnect(connection);
  var connectionTimeout = setTimeout(function () { connection.destroy(); },1000);
  connection.connect(function(err) {
    if (err) { console.log("**Query**",err); errorCb(false,err); }
    else { successCb(connection); }
    clearTimeout(connectionTimeout);
  });
}