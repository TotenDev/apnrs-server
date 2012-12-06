var fs = require("fs");
module.exports = function definitions () {
  this.serverOptions = {
    rest:{
      clientSecretUser:"clientOI",
      serverSecretUser:"serverIO",
      commonSecretPass:"commonPass",
      serverPort:8080,
      requestLimit:100,
      cert:fs.readFileSync('./../dev/certificate.pem').toString(),
      key:fs.readFileSync('./../dev/privatekey.pem').toString()
    },
    database:{
      host:'localhost',
      user:'root',
      password:'',
      database:'apnrs'
    },push:{
      cert:"cert",
      key:"key"
    }
  };
  this.basicAuthClient = "Basic " + new Buffer(this.serverOptions.rest.clientSecretUser+":"+this.serverOptions.rest.commonSecretPass).toString('base64');
  this.basicAuthServer = "Basic " + new Buffer(this.serverOptions.rest.serverSecretUser+":"+this.serverOptions.rest.commonSecretPass).toString('base64');
  return this;
}