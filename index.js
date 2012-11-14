//
// index.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//

var APNRestServer = require('./lib/server.js');
APNRestServer({clientSecretUser:"clientOI",serverSecretUser:"serverIO" ,commonSecretPass:"man",metrics:{projectID:"99",auth:"Basic dedewdewdew",host:"metrics.totendev.com",port:"8080",path:"/"},database:{host:'localhost',user:'root',password:'root',database:'apnrs'}});
var basicAuthClient = "Basic " + new Buffer("clientOI:man").toString('base64');
var basicAuthServer = "Basic " + new Buffer("serverIO:man").toString('base64');
//
var restify = require('restify');
var client1 = restify.createJsonClient({ url: 'http://127.0.0.1:8080/list/devices', headers: { 'Authorization':basicAuthClient,'Accept':"application/json",'Content-Type':"application/json" }});
client1.post("/register",{ hello: 'world' },function (err,req,res,obj) {
  console.log("ERRORRRR:",err," -- ",res.statusCode);
});