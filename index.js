// index.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
var APNRestServiceServer = require('./lib/server.js'),
                      fs = require('fs');

//Server Options (HERE YOU SHOULD CHANGE)
var options = {
  rest:{
    clientSecretUser:"clientOI",
    serverSecretUser:"serverIO",
    commonSecretPass:"man",
    serverPort:8080,
    requestLimit:100//,
//    cert:fs.readFileSync('./dev/certificate.pem').toString(),
//    key:fs.readFileSync('./dev/privatekey.pem').toString()
  },database:{
    host:'localhost',
    user:'root',
    password:'root',
    database:'apnrs'
  },push:{
    cert:fs.readFileSync('./dev/cert.pem'),
    key:fs.readFileSync('./dev/key.pem')
  }
};

//Keep alive helper
function startServerListeners() {
  process.on('uncaughtException', function (err) {
    console.log("APNS uncaught exception:",err.stack);
    console.log("Restarting server in 2 seconds...");
    setTimeout(startServer,2000);
  });
  process.on('exit', function () { console.log("APNRS server is going down"); });
}
function startServer() { server = APNRestServiceServer(options); }
//Start
startServerListeners();
startServer();