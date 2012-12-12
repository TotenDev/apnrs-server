//
// APNDevice.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    deviceStoreWrapper = require('./APNDeviceQueryWrapper.js'),
    definitions = require('./definitions.js')();
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
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceRegister = function APNDeviceRegister(bodyData,callback) {
  //Check for required value
  if (bodyData && bodyData['token'] && bodyData['token'].length > 0) {
    var token = bodyData['token'].replace("-","").toLowerCase(), startDate = null, endDate = null, timeZone = null, tags = null;
    //optional values
    if (bodyData['silentTime'] && bodyData['silentTime']['startDate'] && bodyData['silentTime']['startDate'].length == 5) { startDate = bodyData['silentTime']['startDate']; }
    else { startDate = '09:00'; /*Defaults*/ }
    if (bodyData['silentTime'] && bodyData['silentTime']['endDate'] && bodyData['silentTime']['endDate'].length == 5) { endDate = bodyData['silentTime']['endDate']; }
    else { endDate = '23:00'; /*Defaults*/ }
    if (bodyData['silentTime'] && bodyData['silentTime']['timezone'] && bodyData['silentTime']['timezone'].length == 5) { timeZone = bodyData['silentTime']['timezone']; }
    else { timeZone = '-0000'; /*Defaults*/ }
    if (bodyData['tags'] && bodyData['tags'].length > 0) { tags = bodyData['tags']; }
    else { tags = []; /*Defaults*/ }
    
    //format date
    var now = new Date(Date.now());
    startDate = twoCharString(now.getMonth()+1) + '/' +  twoCharString(now.getDate()) + '/' + now.getFullYear() + ' ' + startDate + ' ' + timeZone;
    var startDateGMT = new Date(startDate);
    var startDateGMTString = twoCharString(startDateGMT.getUTCHours()) + ":" + twoCharString(startDateGMT.getUTCMinutes()) + ":00";
    endDate = twoCharString(now.getMonth()+1)  + '/' +  twoCharString(now.getDate()) + '/' + now.getFullYear() + ' ' + endDate + ' ' + timeZone;
    var endDateGMT = new Date(endDate);
    var endDateGMTString = twoCharString(endDateGMT.getUTCHours())+":"+twoCharString(endDateGMT.getUTCMinutes())+":00";
    //try to insert into device
    this.deviceWrapper.APNDeviceRegisterOnDB(token,tags,startDateGMTString,endDateGMTString,0,callback);/*Create/Update device into DB*/
  }else { callback(definitions.retValAccept,"token key is missing :("); }
}
/**
* Unregister APNDevice function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceUnregister = function APNDeviceUnregister(token,callback) {
    //Check for required values
    if (!token || token.length == 0) { assert.ok(false,"** APNDevice ** token is **REQUIRED** ,but is not specified."); }
    //try to insert into device
    this.deviceWrapper.APNDeviceUnregisterOnDB(token,callback);
}
/**
* List Devices function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceList = function APNDeviceList(bodyData,callback) {
  //list registered devices
  if (bodyData && bodyData['order'] && bodyData['order'].length == 3) {
    var order = bodyData['order'];
    if (order == 'DSC' || order == 'ASC') { this.deviceWrapper.APNDeviceListOnDB(order,callback);/*List device in DB*/ }
    else { callback(definitions.retValAccept,"order value is invalid :("); }
  }else { callback(definitions.retValAccept,"order key is missing :("); }
}
/**
* List Tags function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListTags = function APNDeviceListTags(bodyData,callback) {
  //list registered devices
  if (bodyData && bodyData['order'] && bodyData['order'].length == 3) {
    var order = bodyData['order'];
    if (order == 'DSC' || order == 'ASC') { this.deviceWrapper.APNDeviceListTagsOnDB(order,callback);/*List tags in DB*/ }
    else { callback(definitions.retValAccept,"order value is invalid :("); }
  }else { callback(definitions.retValAccept,"order key is missing :("); }
}
/**
* List Device Register Call function
* @param Obj bodyData - body data recieved on request
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDevice.prototype.APNDeviceListDeviceRegisterDataPoints = function APNDeviceListDeviceRegisterDataPoints(bodyData,callback) {
  //device create
  if (bodyData && bodyData['startDate'] && bodyData['startDate'].length > 7 && 
                  bodyData['endDate'] && bodyData['endDate'].length > 7) {
    var startDate = bodyData['startDate'], 
        endDate = bodyData['endDate'];
    //make sure date is in correct format and it's on GMT
    var startDateGMT = new Date(startDate);
    var endDateGMT = new Date(endDate);
    if (startDateGMT == 'Invalid Date' || endDateGMT == 'Invalid Date') { callback(definitions.retValAccept,'start or end date is invalid'); }
    else {
      var startDateGMTString = startDateGMT.getUTCFullYear()  + '-' +  twoCharString(startDateGMT.getUTCMonth()+1) + '-' + twoCharString(startDateGMT.getUTCDate()) + ' ' + twoCharString(startDateGMT.getUTCHours())+":" + twoCharString(startDateGMT.getUTCMinutes()) + ":" + twoCharString(startDateGMT.getUTCSeconds());
      var endDateGMTString = endDateGMT.getUTCFullYear()  + '-' +  twoCharString(endDateGMT.getUTCMonth()+1) + '-' + twoCharString(endDateGMT.getUTCDate()) + ' ' + twoCharString(endDateGMT.getUTCHours()) + ":" + twoCharString(endDateGMT.getUTCMinutes()) + ":" + twoCharString(endDateGMT.getUTCSeconds());
      //
      this.deviceWrapper.APNDeviceListDeviceRegisterDataPointsOnDB(startDateGMTString,endDateGMTString,callback); 
    }
  }else { callback(definitions.retValAccept,"token key is missing :("); }
}