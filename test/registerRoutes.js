//
// registerRoutes.js — APNRS
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
//Route '/register'
tap.test("\nDevice register body",function (t) {
  var bodies = [{token:'myToken',responseCodeNeeded:200,testDescription:'simple device registration'},
                {token:'myToken',tags:['red','blue'],responseCodeNeeded:200,testDescription:'device w/tags registration'},
                {token:'myToken',tags:['blue'],responseCodeNeeded:200,testDescription:'device w/tag registration'},
                {token:'myToken',tags:['blue'],responseCodeNeeded:200,silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'device w/tag&silentTime registration'},
                {token:'myToken',responseCodeNeeded:200,silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'device w/silentTime registration'},
                {responseCodeNeeded:204,tags:['blue'],silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'error no token registration'},
                {token:'',responseCodeNeeded:204,tags:['blue'],silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'error invalid token registration'},
                {token:'myToken',responseCodeNeeded:200,tags:['blue'],silentTime:{startDate:'09',endDate:'23',timezone:'what time zome ?'},testDescription:'invalid silent time becomes default'},
                {token:'myToken',responseCodeNeeded:200,tags:['blue'],silentTime:{startDate:'02:00',endDate:'15:00'},testDescription:'incomplete silent time becomes default'},
                {token:'myToken',responseCodeNeeded:200,tags:[],silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'with tags key but not tags'},
                {token:'myToken',responseCodeNeeded:200,tags:['blue'],silentTime:{startDate:'09:00',endDate:'23:00',timezone:'-0300'},testDescription:'full registration'},],
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
setTimeout(function () {
    console.log("closing server");
    server.closeServer();
},1500);