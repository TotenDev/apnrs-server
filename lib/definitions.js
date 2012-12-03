function definitions () {
  var self = this;
  this.retValError = 0;
  this.retValAccept = 1;
  this.retValSuccess = 2;
  this.encodeErrorToJSON = function (err) { return new Error('{"error":"' + err + ' ;("'); }
  this.dieQueryError = function (connection,callback,resp) {
    callback(self.retValError,'query error '+resp);
    if (connection && connection!=null) connection.end();
  }
  this.respondQueryCallback = function (connection,callback,status,resp) {
    if (status) {  
      callback(self.retValSuccess,resp); 
      if (connection && connection!=null) connection.end();
    }
    else { self.dieQueryError(connection,callback,resp); }
  }
  this.respondRequest = function (requestResponse,status,resp) {
    if (status == this.retValSuccess) { requestResponse.send(200,resp); }
    else if (status == this.retValAccept) { requestResponse.send(204,this.encodeErrorToJSON(resp)); }
    else { requestResponse.send(500,this.encodeErrorToJSON(resp)); }
  }
  return this;
}
definitions.instance = null;
module.exports = function () {
  if (definitions.instance === null) { this.instance = new definitions(); }
  return this.instance;
}