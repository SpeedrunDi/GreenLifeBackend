const jwt = require('jsonwebtoken')

module.exports.getToken = (displayName, expirationTime) => {
  return jwt.sign({displayName}, process.env.TOKEN_KEY, {
    expiresIn: expirationTime,
  })
}