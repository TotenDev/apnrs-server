function definitions () {
  var self = this;
  this.retValError = 0;
  this.retValAccept = 1;
  this.retValSuccess = 2;
  this.encodeErrorToJSON = function (err) { return new Error('Error:\'' + err + '\''); }
  this.encodeToJSON = function (resp) { return new Error(resp); }
  this.dieQueryError = function (connection,callback,resp) {
    callback(self.retValError,'query error '+resp);
    if (connection && connection!=null) connection.end();
  }
  this.respondQueryCallback = function (connection,callback,status,resp) {
    if (status) { 
      if (connection && connection!=null) connection.end();
      callback(status,resp); 
    }
    else { self.dieQueryError(connection,callback,resp); }
  }
  this.respondRequest = function (requestResponse,status,resp) {
    if (status == self.retValSuccess) { requestResponse.send(200,resp); }
    else if (status == self.retValAccept) { requestResponse.send(202,self.encodeToJSON(resp)); }
    else { requestResponse.send(500,self.encodeErrorToJSON(resp)); }
  }
  return this;
}
definitions.instance = null;
module.exports = function () {
  if (definitions.instance === null) { this.instance = new definitions(); }
  return this.instance;
}