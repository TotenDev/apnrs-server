//
// sendMessageRoute.js — APNRS
// today is 11/03/12, it is now 10:25 AM
// created by TotenDev
// see LICENSE for details.
//
  
var tap = require("tap"),
    APNRestServer = require('./../lib/server.js'),
    restify = require('restify'),
    queue = require("function-queue")(),
    definitions = require('./definitions.js')();
    //
//
var server = APNRestServer(definitions.serverOptions);
var basicAuthClient = definitions.basicAuthClient;
var basicAuthServer = definitions.basicAuthServer;
//Fill DB with data
tap.test("\nfilling db with data",function (t) {
  var bodies = [{token:'myToken',responseCodeNeeded:200,tags:['blue','red'],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'full registration'}],
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
//Route '/list/devices'
tap.test("\nSend Push Notification",function (t) {
  var bodies = [{order:'ASC',responseCodeNeeded:200,testDescription:'simple device list (ASC)'},
                {order:'ASCA',responseCodeNeeded:204,testDescription:'invalid order in device list (with substring order)'},
                {order:'DESC',responseCodeNeeded:204,testDescription:'invalid order in device list'},
                {order:'',responseCodeNeeded:204,testDescription:'incomplete order in device list'},
                {responseCodeNeeded:204,testDescription:'missing order in device list'}],
      idx = 0 ;
  t.plan(bodies.length);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/sendpush",bodies[idx],function (err,req,res,obj) {
//        if (bodies[idx].responseCodeNeeded == 200 && obj.length > 0) { t.ok(true,'contains objects in list devices'); }
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