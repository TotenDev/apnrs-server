//
// deviceRoutes.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//
  
var tap = require("tap"),
    APNRestServer = require('./../lib/server.js'),
    restify = require('restify'),
    queue = require("function-queue")();
    //
var server = APNRestServer({clientSecretUser:"clientUser",serverSecretUser:"clientServer" ,commonSecretPass:"commonPass",metrics:{projectID:"99",auth:"Basic dedewdewdew",host:"metrics.totendev.com",port:"8080",path:"/"},database:{host:'localhost',user:'root',password:'root',database:'apnrs',port:8889}});
var basicAuthClient = "Basic " + new Buffer("clientUser:commonPass").toString('base64');
var basicAuthServer = "Basic " + new Buffer("clientServer:commonPass").toString('base64');
//
tap.test("\nDevice register body",function (t) {
  var bodies = [{token:'myToken',responseCodeNeeded:200,testDescription:'simple device registration'},
                {token:'myToken',tags:['red','blue'],responseCodeNeeded:200,testDescription:'device w/tags registration'},
                {token:'myToken',tags:['blue'],responseCodeNeeded:200,testDescription:'device w/tag registration'},
                {token:'myToken',tags:['blue'],responseCodeNeeded:200,startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'device w/tag&silentTime registration'},
                {token:'myToken',responseCodeNeeded:200,startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'device w/silentTime registration'},
                {responseCodeNeeded:204,tags:['blue'],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'error no token registration'},
                {token:'',responseCodeNeeded:204,tags:['blue'],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'error invalid token registration'},
                {token:'myToken',responseCodeNeeded:200,tags:['blue'],startDate:'09',endDate:'23',timezone:'what time zome ?',testDescription:'invalid silent time becomes default'},
                {token:'myToken',responseCodeNeeded:200,tags:['blue'],startDate:'02:00',endDate:'15:00',testDescription:'incomplete silent time becomes default'},
                {token:'myToken',responseCodeNeeded:200,tags:[],startDate:'09:00',endDate:'23:00',timezone:'-0300',testDescription:'with tags key but not tags'},],
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

setTimeout(function () {
    console.log("closing server");
    server.closeServer();
},1500);