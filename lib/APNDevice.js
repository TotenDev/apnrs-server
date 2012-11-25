//
// APNDevice.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    deviceDB = require('./APNDeviceDB.js')();
/**
* Initialize APNDevice function
**/
module.exports = function (database) { return new APNDevice(database); }
function APNDevice(database) { 
  this.databaseInformations = database;
}
///**
//* Fill device by ID
//* @param String deviceID - device id (this will be checked, because this token is unique on system) - REQUIRED
//* @param Function callback - function callback - REQUIRED
//* @param Boolean callback.errored - if filled okay (false) or with errored (true).
//* @param String callback.resp - response string when convinient.
//* 
//**/
//APNDevice.prototype.fillByID = function fillByID(deviceID,callback) { 
//  //Check for required values
//  if (!deviceID) { assert.ok(false,"** APNDevice ** deviceID is **REQUIRED** ,but is not specified."); }
//  //create database connection for creating
//  this.defaultDatabaseConnection(this.databaseInformations,function (connection) {
//    console.log("fillByID is not implemented");
//    dsdsds;
//    //fetch
//    instance.getObjetctInDB(connection,'id',deviceID,APNDeviceDatabaseMysqlKey,function (okay,responseSelect) {
//      if (okay) { callback(true,null); }
//      else { callback(false,result); }
//      connection.end();
//    });
//  },function (err) { callback(true,err); });
//}
///**
//* Fill device by Token
//* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
//* @param Function callback - function callback - REQUIRED
//* @param Boolean callback.errored - if filled okay (false) or with errored (true).
//* @param String callback.resp - response string when convinient.
//**/
//APNDevice.prototype.fillByToken = function fillByToken(token) { 
//  //Check for required values
//  if (!token) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
//  //create database connection for creating
//  this.defaultDatabaseConnection(this.databaseInformations,function (connection) {
//    console.log("fillByToken is not implemented");
//    dsdsds;
//    //fetch
//    instance.getObjetctInDB(connection,'token','\''+token+'\'',APNDeviceDatabaseMysqlKey,function (okay,responseSelect) {
//      if (okay) { callback(true,null); }
//      else { callback(false,result); }
//      connection.end();
//    });
//  },function (err) { callback(true,err); });
//}
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
/**
* List Devices function
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceList = function APNDeviceList(order,callback) {
    //Check for required values
    if (!order || order.length == 0) { assert.ok(false,"** APNDevice ** order is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.APNDeviceListOnDB(order,callback);/*List device in DB*/
}
/**
* List Tags function
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListTags = function APNDeviceListTags(order,callback) {
    //Check for required values
    if (!order || order.length == 0) { assert.ok(false,"** APNDevice ** order is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.APNDeviceListTagsOnDB(order,callback);/*List device in DB*/
}









/*Private*/
/** 
* List Tags
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListTagsOnDB = function APNDeviceListTagsOnDB(order,callback) {
  var order = (order == 'DSC' ? 'DESC' : 'ASC');
  //create database connection for listing
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list tags on db 
    deviceDB.listTagsOnDB(connection,order,function (queryStatus,tags) {
      if (queryStatus) {  callback(true,tags); }
      else { callback(false,'query error '+tags); connection.end(); }
    });
  },function (err) { callback(false,err); });
}
/** 
* List Devices
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListOnDB = function APDeviceList(order,callback) {
  var order = (order == 'DSC' ? 'DESC' : 'ASC');
  //create database connection for listing
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    deviceDB.listDevicesOnDB(connection,order,function (queryStatus,devices) {
      if (queryStatus) {  callback(true,devices); }
      else { callback(false,'query error '+devices); connection.end(); }
    });
  },function (err) { callback(false,err); });
}
/**
* Create or Update device into database
* @param all paramateres are required
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceRegisterOnDB = function APNDeviceRegisterOnDB(active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  //create database connection for creating
  deviceDB.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //Create or Update device in database
    deviceDB.APNDeviceCreateUpdate(connection,active,token,tags,startDateGMT,endDateGMT,deviceBadge,function (queryStatus,deviceID) {
      if (queryStatus) { 
        //Create tags in database
        deviceDB.APNDeviceCreateUpdateTags(connection,tags,function (queryStatus,respID) {
          if (queryStatus) {
            //Clean Tags associated with that device
            deviceDB.APNDeviceCleanTagsOfDevice(connection,deviceID,function (queryStatus,response) {
              if (queryStatus) {
                //Associate tags with device
                deviceDB.APNDeviceAssociateDeviceWithTag(connection,deviceID,respID,function (queryStatus,resp) {
                  if (queryStatus) { callback(true,'OK'); }
                  else { callback(false,'query error '+resp); }
                  //Clean unused tags
                  deviceDB.APNDeviceCleanUnusedTags(connection,function(queryStatus,response2) { connection.end(); })
                });
              }else { callback(false,'query error '+response); connection.end(); }
            });
          } else { callback(false,'query error '+respID); connection.end(); }
        });
      } else { callback(false,'query error '+deviceID+queryStatus); connection.end(); }
    });
  },function (err) { callback(false,err); });
}