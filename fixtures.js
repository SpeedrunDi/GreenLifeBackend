const mongoose = require('mongoose')
const { nanoid } = require('nanoid')

const config = require('./config')
const User = require('./models/User')
const Product = require("./models/Product");

const run = async () => {
  mongoose.set('strictQuery', false)

  await mongoose.connect(config.mongo.db)

  const collections = await mongoose.connection.db.listCollections().toArray()

  for (const coll of collections) {
    await mongoose.connection.db.dropCollection(coll.name)
  }

  const [admin, user] = await User.create(
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

  await Product.create({
    title: "Nvidia RTX 3080",
    price: 2000,
    image: 'fixtures/cpu.jpg',
  }, {
    title: "i3 11 500",
    price: 150000,
    image: 'fixtures/rtx3080.jpg',
  }, {
    title: "lenovo",
    description: "ryzen 5 5300u",
    price: 70000,
    image: 'fixtures/notebook.jpg',
  });

  await mongoose.connection.close()
}

run().catch(console.error)
