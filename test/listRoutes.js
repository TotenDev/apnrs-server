//
// listRoutes.js — APNRS
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
  var bodies = [{token:'myToken',responseCodeNeeded:200,tags:['blue','red'],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'full registration'}],
      idx = 0 ;
  t.plan(bodies.length);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'https://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/register",bodies[idx],function (err,req,res,obj) {
        t.equal(res.statusCode,bodies[idx].responseCodeNeeded,"("+bodies[idx].responseCodeNeeded+") " + bodies[idx].testDescription);
        idx+=1;
        nextTest();
      });    
    });
  }
});
//Route '/list/devices'
tap.test("\nDevice list body",function (t) {
  var bodies = [{order:'ASC',responseCodeNeeded:200,testDescription:'simple device list (ASC)'},
                {order:'ASCA',responseCodeNeeded:204,testDescription:'invalid order in device list (with substring order)'},
                {order:'DESC',responseCodeNeeded:204,testDescription:'invalid order in device list'},
                {order:'DAA',responseCodeNeeded:204,testDescription:'invalid order in device list'},
                {order:'',responseCodeNeeded:200,testDescription:'incomplete order in device list'},
                {responseCodeNeeded:204,testDescription:'missing order in device list'}],
      idx = 0 ;
  t.plan(bodies.length+1);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'https://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/list/devices",bodies[idx],function (err,req,res,obj) {
        if (bodies[idx].responseCodeNeeded == 200 && obj.length > 0) { t.ok(true,'contains objects in list devices'); }
        t.equal(res.statusCode,bodies[idx].responseCodeNeeded,"("+bodies[idx].responseCodeNeeded+") " + bodies[idx].testDescription);
        idx+=1;
        nextTest();
      });    
    });
  }
});
//Route '/list/tags'
tap.test("\nTags list body",function (t) {
  var bodies = [{order:'ASC',responseCodeNeeded:200,testDescription:'simple tags list (ASC)'},
                {order:'ASCA',responseCodeNeeded:204,testDescription:'invalid order in device list (with substring order)'},
                {order:'DESC',responseCodeNeeded:204,testDescription:'invalid tags list'},
                {order:'',responseCodeNeeded:204,testDescription:'incomplete order in tags list'},
                {responseCodeNeeded:204,testDescription:'missing order in tags list'}],
      idx = 0 ;
  t.plan(bodies.length+1);
  for (var i = 0; i < bodies.length; i++) {
    queue.push(function (nextTest) {
      var client = restify.createJsonClient({ url: 'https://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
      client.post("/list/tags",bodies[idx],function (err,req,res,obj) {
        if (bodies[idx].responseCodeNeeded == 200 && obj.length > 1) { t.ok(true,'contains objects in list tags'); }
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