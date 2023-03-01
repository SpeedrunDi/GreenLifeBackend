const path = require('path')

const rootPath = __dirname

module.exports = {
  rootPath,
  uploadPath: path.join(rootPath, 'public/uploads'),
  mongo: {
    db: 'mongodb+srv://admin:admin@greenlife.yyy0zey.mongodb.net/?retryWrites=true&w=majority',
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