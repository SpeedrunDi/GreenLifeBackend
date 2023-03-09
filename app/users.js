const express = require("express")
const User = require("../models/User");
const auth = require("../middleware/auth");
const {getToken} = require("../middleware/token");

const router = express.Router()

const getLiveCookie = user => {
  const { name } = user
  return { token: getToken(name) }
}

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({message: "You not have right!"});
    }

    const users = await User.find({ role: 'user' })

    return res.send(users)
  } catch {
    return res.sendStatus(500)
  }
})

router.post('/', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const userData = { email, password, name }

    const user = new User(userData)

    const { token } = getLiveCookie(user)

    user.token = token

    await user.save()

    return res.send(user)
  } catch (e) {
    return res.status(400).send(e)
  }
})

router.post('/sessions/cookies', async (req, res) => {
  try {
    if (!req.query.token) {
      return res.status(400).send({error: "Cookies not valid"})
    }

    const user = await User.findOne({ token: req.query.token })

    if (!user) {
      return res.status(404).send({error: "User not found"})
    }

    return res.send(user)
  } catch (e) {
    return res.status(500).send(e)
  }
})

router.post('/sessions', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    const isMatch = await user.checkPassword(req.body.password)
    if (!isMatch) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    const { token } = getLiveCookie(user)

    user.token = token
    await user.save({ validateBeforeSave: false })

    return res.send(user)
  } catch (e) {
    return res.status(500).send({ error: e })
  }
})

router.delete('/sessions', async (req, res) => {
  try {
    const success = { message: 'Success' }
    const cookie = req.query.token

    if (!cookie) return res.send(success)

    const user = await User.findOne({ token: cookie })

    if (!user) return res.send(success)

    const { token } = getLiveCookie(user)
    user.token = token

    await user.save({ validateBeforeSave: false })

    return res.send({ success, user })
  } catch (e) {
    return res.status(500).send(e)
  }
})

module.exports = router