//
// APNDevice.js — APNRSqueries
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert'),
    queries = require('./APNQueries.js')(),
    definitions = require('./definitions.js')();
/**
* Initialize APNDevice function
**/
module.exports = function (databaseOptions) { return new APNDeviceQueryWrapper(databaseOptions); }
function APNDeviceQueryWrapper(databaseOptions) { 
  this.databaseInformations = databaseOptions;
}
/*Private*/
/** 
* List Tags
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDeviceQueryWrapper.prototype.APNDeviceListTagsOnDB = function APNDeviceListTagsOnDB(order,callback) {
  var order = (order == 'DSC' ? 'DESC' : 'ASC');
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list tags on db 
    queries.listTags(connection,order,function (status,resp) {
      definitions.respondQueryCallback(connection,callback,status,resp);
    });
  },callback);
}
/** 
* List Devices
* @param order - string - can be ASC or DSC (not DESC)
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDeviceQueryWrapper.prototype.APNDeviceListOnDB = function APDeviceList(order,callback) {
  var order = (order == 'DSC' ? 'DESC' : 'ASC');
  //create database connection for listing
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list devuces on db 
    queries.listDevices(connection,order,function (status,resp) {
      definitions.respondQueryCallback(connection,callback,status,resp);
    });
  },callback);
}
/**
* Create or Update device into database
* @param all paramateres are required
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDeviceQueryWrapper.prototype.APNDeviceRegisterOnDB = function APNDeviceRegisterOnDB(token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  //create database connection for creating
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //Create or Update device in database
    queries.createUpdateDevices(connection,1,token,tags,startDateGMT,endDateGMT,deviceBadge,function (queryStatus,deviceID) {
      if (queryStatus) { 
        //Create tags in database
        queries.createUpdateTags(connection,tags,function (queryStatus,respID) {
          if (queryStatus) {
            //Clean Tags associated with that device
            queries.cleanTagsOfDevice(connection,deviceID,function (queryStatus,response) {
              if (queryStatus) {
                //Associate tags with device
                queries.associateDeviceWithTag(connection,deviceID,respID,function (status,resp) {
                  //respond
                  definitions.respondQueryCallback(null,callback,status,(status ? '' : resp));
                  //make low priority queries
                  queries.logRegisterDevice(connection,deviceID,1,function (leStatus,response2) {
                    //Clean unused tags
                    queries.cleanUnusedTags(connection,function(queryStatus,response3) { connection.end(); }) 
                  });
                });
              }else { definitions.dieQueryError(connection,callback,response); }
            });
          } else { definitions.dieQueryError(connection,callback,respID); }
        });
      } else { definitions.dieQueryError(connection,callback,deviceID); }
    });
  },callback);
}
/**
* Unregister device into database
* @param all paramateres are required
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDeviceQueryWrapper.prototype.APNDeviceUnregisterOnDB = function APNDeviceUnregisterOnDB(token,callback) {
  //create database connection for creating
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //Create or Update device in database
    queries.unregisterDevice(connection,token,function (queryStatus,deviceID) {
      if (queryStatus && deviceID) { 
        callback(definitions.retValSuccess,'');
        queries.logRegisterDevice(connection,deviceID,0,function (leStatus,response2) { connection.end(); });
      } else { definitions.dieQueryError(connection,callback,deviceID); }
    });
  },callback);
}
/**
* List Device Register Call on Database function
* @param Date startDate - date to start datapoints of registering and unregistering
* @param Date endDate - date to end datapoints of registering and unregistering
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNDeviceQueryWrapper.prototype.APNDeviceListDeviceRegisterDataPointsOnDB = function APNDeviceListDeviceRegisterDataPointsOnDB(startDate,endDate,callback) {
  //create database connection for creating
  queries.defaultDatabaseConnection(this.databaseInformations,function (connection) {
    //list register calls on database
    queries.listDeviceRegisterCalls(connection,startDate,endDate,function (status,resp) {
      definitions.respondQueryCallback(connection,callback,status,resp);
    });
  },callback);
}