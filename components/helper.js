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