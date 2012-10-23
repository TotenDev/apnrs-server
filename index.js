//
// index.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//


var APNRestServer = require('./lib/server.js');
var restify = require('restify');
APNRestServer({clientSecretUser:"clientOI",serverSecretUser:"serverIO" ,commonSecretPass:"mano"});

var basicAuthClient = "Basic " + new Buffer("clientOI:mano").toString('base64');
var basicAuthServer = "Basic " + new Buffer("serverIO:mano").toString('base64');
var client1 = restify.createJsonClient({ url: 'http://127.0.0.1:8080/list/devices', headers: { 'Authorization':basicAuthClient,'Accept':"application/json",'Content-Type':"application/json" }});
client1.post("/regist",{ hello: 'world' },function (err,req,res,obj) {
  console.log(err," -- ");
});