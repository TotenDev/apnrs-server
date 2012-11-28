//
// statsRoutes.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//
  
var tap = require("tap"),
    APNRestServer = require('./../lib/server.js'),
    restify = require('restify'),
    queue = require("function-queue")(),
    definitions = require('./definitions.js')();
//
var server = APNRestServer(definitions.serverOptions);
var basicAuthClient = definitions.basicAuthClient;
var basicAuthServer = definitions.basicAuthServer;
//Fill DB with data
tap.test("\nfilling db with data",function (t) {
  var bodies = [{token:'myToken',responseCodeNeeded:200,tags:['blue'],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'full registration'}],
      idx = 0 ;
  t.plan(bodies.length);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/register",bodies[idx],function (err,req,res,obj) {
        t.equal(res.statusCode,bodies[idx].responseCodeNeeded,"("+bodies[idx].responseCodeNeeded+") " + bodies[idx].testDescription);
        idx+=1;
        nextTest();
      });    
    });
  }
});
//Route '/stats/devices'
tap.test("\nStats Devices body",function (t) {
  var bodies = [{startDate: '11/11/2012',endDate:'12/12/2012',responseCodeNeeded:200,testDescription:'simple stats without hours...'},
                {startDate: '11/11/2012 09:09:12',endDate:'12/12/2012 08:00:00',responseCodeNeeded:200,testDescription:'simple stats with full date'},
                {startDate: '11/11/2012',endDate:'12/12/2012 08:00:00',responseCodeNeeded:200,testDescription:'simple stats with mix dates'},
                {startDate: '11/11',endDate:'12/10',responseCodeNeeded:500,testDescription:'simple stats with incomplete date'},
                {startDate: '11/11',endDate:'12',responseCodeNeeded:500,testDescription:'simple stats with incomplete date'},
                {startDate: '11/11',responseCodeNeeded:204,testDescription:'simple stats with incomplete keys'},
                {responseCodeNeeded:204,testDescription:'simple stats with no keys'}],
      idx = 0 ;
  t.plan(bodies.length+1);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/stats/devices",bodies[idx],function (err,req,res,obj) {
        if (bodies[idx].responseCodeNeeded == 200 && obj.length > 0) { t.ok(true,'contains objects in list tags'); }
        t.equal(res.statusCode,bodies[idx].responseCodeNeeded,"("+bodies[idx].responseCodeNeeded+") " + bodies[idx].testDescription);
        idx+=1;
        nextTest();
      });    
    });
  }
});
setTimeout(function () {
    console.log("closing server");
    server.closeServer();
},1500);