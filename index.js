//
// index.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//

//var APNRestServer = require('./lib/server.js');
//APNRestServer({clientSecretUser:"clientOI",serverSecretUser:"serverIO" ,commonSecretPass:"man",database:{host:'localhost',user:'root',password:'root',database:'apnrs'}});
//var basicAuthClient = "Basic " + new Buffer("clientOI:man").toString('base64');
//var basicAuthServer = "Basic " + new Buffer("serverIO:man").toString('base64');
////
//var restify = require('restify');
//var client1 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
//client1.post("/register",{ token: 'pa',tags:["macarrao","marron"] },function (err,req,res,obj) {
//  console.log('%d -> %j', res.statusCode, res.headers);
//  console.log('-- %j', obj);
//});

var csrequire = require('covershot').require.bind(null, require);

// coverage will be collected for this file and all files it requires
var myLibrary = csrequire('./lib-cov/');