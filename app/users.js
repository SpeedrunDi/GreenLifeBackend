const express = require("express")
const User = require("../models/User");
const auth = require("../middleware/auth");
const {getToken} = require("../middleware/token");

const router = express.Router()

const getLiveCookie = user => {
  const { name } = user
  const maxAge = 730 * 60 * 60
  return { token: getToken(name, maxAge), maxAge }
}

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })

    return res.send(users)
  } catch {
    return res.status(500)
  }
})

router.post('/', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const userData = { email, password, name }

    const user = new User(userData)

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('greenlife', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token

    await user.save()

    return res.status(201).send(user)
  } catch (e) {
    return res.status(400).send(e)
  }
})

router.post('/sessions', async (req, res) => {
  try {
    if (req.cookies.greenlife) {
      const user = await User.findOne({ token: req.cookies.greenlife })
      return res.send(user)
    }

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

    const { token, maxAge } = getLiveCookie(user)

    if (req.body?.remember) {
      res.cookie('greenlife', token, {
        httpOnly: false,
        maxAge: maxAge * 1000,
      })
    }

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
    const cookie = req.cookies.greenlife

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