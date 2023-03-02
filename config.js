const path = require('path')

const rootPath = __dirname

module.exports = {
  rootPath,
  uploadPath: path.join(rootPath, 'public/uploads'),
  mongo: {
    db: process.env.MONGODB || 'mongodb://localhost/green_life',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.ADMIN_CHAT
  }
}