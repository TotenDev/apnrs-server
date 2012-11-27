//
// serverRoutes.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//
  
var tap = require("tap"),
    APNRestServer = require('./../lib/server.js'),
    restify = require('restify');
    //
var server = APNRestServer({clientSecretUser:"clientUser",serverSecretUser:"clientServer" ,commonSecretPass:"commonPass",database:{host:'localhost',user:'root',password:'',database:'apnrs'}});
var basicAuthClient = "Basic " + new Buffer("clientUser:commonPass").toString('base64');
var basicAuthServer = "Basic " + new Buffer("clientServer:commonPass").toString('base64');
//
tap.test("\nRouting",function (t) {
  t.plan(4);
  var client1 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
  client1.post("/register2",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,404,"(404) Route not found for server credentials.");
  });
  var client2 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthClient,'Accept':"application/json",'Content-Type':"application/json" }});
  client2.post("/register2",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,403,"(403) Forbidden for client credentials with route not found.");
  });
  var client3 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Accept':"application/json",'Content-Type':"application/json" }});
  client3.post("/register2",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,401,"(401) Unauthorized with route not found and no credentials specified.");
  });
  var client4 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Accept':"application/json",'Content-Type':"application/json" }});
  client4.post("/register/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,401,"(401) Unauthorized with good route but no credentials specified.");
  });  
});
//
tap.test("\nAuthentications",function (t) {
  t.plan(6);
  var client = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
  client.post("/list/tags/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,204,"(204) With server credentials. (no properly body)");
  });
  var client1 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthClient,'Accept':"application/json",'Content-Type':"application/json" }});
  client1.post("/register/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,204,"(204) With client credentials. (no properly body)");
  });
  var client2 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':'hey oh','Accept':"application/json",'Content-Type':"application/json" }});
  client2.post("/register/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,401,"(401) Forbidden with invalid basic format credentials.");
  });
  var client3 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':'Basic c2FtcGxlOnRleHQ=','Accept':"application/json",'Content-Type':"application/json" }});
  client3.post("/register/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,403,"(403) Forbidden with wrong credentials.");
  });
  var client4 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
  client4.post("/register/",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,204,"(204) Allow server credentials accessing client route. (no properly body)");
  });
  var client5 = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthClient,'Accept':"application/json",'Content-Type':"application/json" }});
  client5.post("/list/tags",{ hello: 'world' },function (err,req,res,obj) {
    t.equal(res.statusCode,403,"(403) Forbidden with client credentials accessing server route.");
  });
});
//
tap.test("\nRoutes",function (t) {
  var routes = ["/register/","/register",
                "/unregister","/unregister/",
                "/sendpush/","/sendpush",
                "/stats/devices","/stats/devices/",
                "/stats/push","/stats/push/",
                "/list/devices/","/list/devices",
                "/list/tags/","/list/tags",
                "/list/push","/list/push/",
                "/list/feedback","/list/feedback/"];
                
  t.plan(routes.length);
  for (var route in routes) {
   var client = restify.createJsonClient({ url: 'http://127.0.0.1:8080', headers: { 'Authorization':basicAuthServer,'Accept':"application/json",'Content-Type':"application/json" }});
   client.post(routes[route],{ hello: 'world' },function (err,req,res,obj) {
    if (req.path == '/register' || req.path == '/register/' || 
        req.path == '/unregister' || req.path == '/unregister/' || 
        req.path == '/list/tags' || req.path == '/list/tags/' || 
        req.path == '/list/devices/' || req.path == '/list/devices') {
      t.equal(res.statusCode,204,"(204) With route '"+ req.path +"'.");
    }else { t.equal(res.statusCode,200,"(200) With route '"+ req.path +"'."); }
   }); 
  }
});

setTimeout(function () {
    console.log("closing server");
    server.closeServer();
},1500);