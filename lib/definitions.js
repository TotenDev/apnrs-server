module.exports = function definitions () {
  
  this.self = this;
  
  this.retValError = 0;
  this.retValAccept = 1;
  this.retValSuccess = 2;
  this.dieQueryError = function (connection,callback,resp) {
    callback(self.retValError,'query error '+tags);
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
    else if (status == this.retValAccept) { requestResponse.send(204,new Error('{"error":"' + resp + ' ;("')); }
    else { requestResponse.send(500,new Error('{"error":"' + resp + ' ;("')); }
  }
  
  return this;
}