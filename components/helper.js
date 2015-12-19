exports.createError = function (status_code, message){
  var error = new Error(message);
  error.status = status_code;
  return error;
}

exports.populateError = function (e, status_code, message){
  e.status = status_code;
  e.message = message;
  return e;
}

exports.handleAPIError = function (e, res){
  var e = e || new Error("API error, not specific error supplied");
  var status = e.status || 500;
  return res.status(status).json({"error": {status: e.status, message: e.message}});
}