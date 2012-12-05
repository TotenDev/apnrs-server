module.exports = function definitions () {
  this.serverOptions = {
    rest:{
      clientSecretUser:"clientOI",
      serverSecretUser:"serverIO",
      commonSecretPass:"commonPass"
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
  };
  this.basicAuthClient = "Basic " + new Buffer(this.serverOptions.rest.clientSecretUser+":"+this.serverOptions.rest.commonSecretPass).toString('base64');
  this.basicAuthServer = "Basic " + new Buffer(this.serverOptions.rest.serverSecretUser+":"+this.serverOptions.rest.commonSecretPass).toString('base64');
  return this;
}