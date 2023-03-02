const jwt = require('jsonwebtoken')
const path = require('path');

const jwtPrivateKey = path.resolve('') + '/keys/private_key.pem';

module.exports.getToken = (displayName, expirationTime) => {
  return jwt.sign({displayName}, jwtPrivateKey, {
    expiresIn: expirationTime,
  })
}