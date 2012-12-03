module.exports = function definitions () {
  this.serverOptions = {clientSecretUser:"clientUser",serverSecretUser:"clientServer" ,commonSecretPass:"commonPass",database:{host:'localhost',user:'root',password:'root',database:'apnrs'}};
  this.basicAuthClient = "Basic " + new Buffer("clientUser:commonPass").toString('base64');
  this.basicAuthServer = "Basic " + new Buffer("clientServer:commonPass").toString('base64');
  return this;
}