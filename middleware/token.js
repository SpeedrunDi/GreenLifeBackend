const jwt = require('jsonwebtoken')

module.exports.getToken = (displayName) => {
  return jwt.sign({displayName}, process.env.SECRET_TOKEN, {
    expiresIn: '60d',
  })
}