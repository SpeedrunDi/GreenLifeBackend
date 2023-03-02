const mongoose = require('mongoose')
const { nanoid } = require('nanoid')

const config = require('./config')
const User = require('./models/User')

const run = async () => {
  mongoose.set('strictQuery', false)

  await mongoose.connect(config.mongo.db)

  const collections = await mongoose.connection.db.listCollections().toArray()

  for (const coll of collections) {
    await mongoose.connection.db.dropCollection(coll.name)
  }

  await User.create(
    {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      token: nanoid(),
      role: 'admin',
    },
    {
      name: 'User',
      email: 'user@gmail.com',
      password: 'user',
      token: nanoid(),
      role: 'user',
    }
  )

  await mongoose.connection.close()
}

run().catch(console.error)
