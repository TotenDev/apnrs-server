//
// APNDevice.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    deviceStoreWrapper = require('./APNDeviceQueryWrapper.js');
/**
* Initialize APNDevice function
**/
module.exports = function (databaseOptions) { return new APNDevice(databaseOptions); }
function APNDevice(databaseOptions) { 
  this.deviceWrapper = deviceStoreWrapper(databaseOptions);
}
//helper fuction
function twoCharString(str) { return ("0" + str).slice(-2); }
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
    startDate = twoCharString(now.getMonth()+1) + '/' +  twoCharString(now.getDate()) + '/' + now.getFullYear() + ' ' + startDate + ' ' + timeZone;
    var startDateGMT = new Date(startDate);
    var startDateGMTString = twoCharString(startDateGMT.getUTCHours()) + ":" + twoCharString(startDateGMT.getUTCMinutes()) + ":00";
    //
    endDate = twoCharString(now.getMonth()+1)  + '/' +  twoCharString(now.getDate()) + '/' + now.getFullYear() + ' ' + endDate + ' ' + timeZone;
    var endDateGMT = new Date(endDate);
    var endDateGMTString = twoCharString(endDateGMT.getUTCHours())+":"+twoCharString(endDateGMT.getUTCMinutes())+":00";
    //try to insert into device
    this.deviceWrapper.APNDeviceRegisterOnDB(token,tags,startDateGMTString,endDateGMTString,0,callback);/*Create/Update device into DB*/
}
/**
* Unregister APNDevice function
* @param String token - device token (this will be checked, because this token is unique on system) - REQUIRED
* @param Function callback - function callback - REQUIRED
**/
APNDevice.prototype.APNDeviceUnregister = function APNDeviceUnregister(token,callback) {
    //Check for required values
    if (!token || token.length == 0) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.deviceWrapper.APNDeviceUnregisterOnDB(token,callback);
}
/**
* List Devices function
* @param String order - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceList = function APNDeviceList(order,callback) {
    //Check for required values
    if (!order || order.length == 0) { assert.ok(false,"** APNDevice ** order is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.deviceWrapper.APNDeviceListOnDB(order,callback);/*List device in DB*/
}
/**
* List Tags function
* @param String order - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListTags = function APNDeviceListTags(order,callback) {
    //Check for required values
    if (!order || order.length == 0) { assert.ok(false,"** APNDevice ** order is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.deviceWrapper.APNDeviceListTagsOnDB(order,callback);/*List device in DB*/
}
/**
* List Device Register Call function
* @param Date startDate - date to start datapoints of registering and unregistering
* @param Date endDate - date to end datapoints of registering and unregistering
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListDeviceRegisterDataPoints = function APNDeviceListDeviceRegisterDataPoints(startDate,endDate,callback) {
    //Check for required values
    if (!startDate || startDate.length == 0) { assert.ok(false,"** APNDevice ** startDate is **REQUIRED** ,but is not specified."); }
    else if (!endDate || endDate.length == 0) { assert.ok(false,"** APNDevice ** endDate is **REQUIRED** ,but is not specified."); }
    //make sure date is in correct format and it's on GMT
    var startDateGMT = new Date(startDate);
    var endDateGMT = new Date(endDate);
    if (startDateGMT == 'Invalid Date' || endDateGMT == 'Invalid Date') {
      callback(false,'start or end date is invalid');
    }else {
      var startDateGMTString = startDateGMT.getUTCFullYear()  + '-' +  twoCharString(startDateGMT.getUTCMonth()+1) + '-' + twoCharString(startDateGMT.getUTCDate()) + ' ' + twoCharString(startDateGMT.getUTCHours())+":" + twoCharString(startDateGMT.getUTCMinutes()) + ":" + twoCharString(startDateGMT.getUTCSeconds());
      var endDateGMTString = endDateGMT.getUTCFullYear()  + '-' +  twoCharString(endDateGMT.getUTCMonth()+1) + '-' + twoCharString(endDateGMT.getUTCDate()) + ' ' + twoCharString(endDateGMT.getUTCHours()) + ":" + twoCharString(endDateGMT.getUTCMinutes()) + ":" + twoCharString(endDateGMT.getUTCSeconds());
      //
      this.deviceWrapper.APNDeviceListDeviceRegisterDataPointsOnDB(startDateGMTString,endDateGMTString,callback); 
    }
}