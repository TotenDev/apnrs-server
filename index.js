//
// index.js — APNRS
// today is 10/14/12, it is now 10:25 PM
// created by TotenDev
// see LICENSE for details.
//

var APNRestServer = require('./lib/server.js');
APNRestServer({
  rest:{
    clientSecretUser:"clientOI",
    serverSecretUser:"serverIO",
    commonSecretPass:"man",
    serverPort:5432,
    requestLimit:100
  },
  database:{
    host:'localhost',
    user:'root',
    password:'root',
    database:'apnrs'
  },push:{
    cert:"cert",
    key:"key"
  }
});