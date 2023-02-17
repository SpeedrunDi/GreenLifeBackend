const express = require("express")
const nodemailer = require("./nodemailer");
const User = require("../models/User");
const auth = require("../middleware/auth");
const {getToken} = require("../middleware/token");

const router = express.Router()

const getLiveCookie = user => {
  const { username } = user
  const maxAge = 730 * 60 * 60
  return { token: getToken(username, maxAge), maxAge }
}

const getLiveSecretCookie = user => {
  const { username } = user
  const maxAge = 5 * 60 * 60
  return { token: getToken(username, maxAge), maxAge }
}

router.get('/', auth, async (req, res) => {
  try {
    const query = { role: { $in: ['ban', 'user'] }, authentication: true }

    if (req.query.email) query.email = req.query.email

    const users = await User.find(query, { name: 1, email: 1, _id: 1, role: 1, username: 1 })

    return res.send(users)
  } catch {
    return res.status(500)
  }
})

router.get('/confirm/:confirmationCode', async (req, res) => {
  try {
    const user = await User.findOne({ confirmationCode: req.params.confirmationCode })
    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }
    user.authentication = true
    await user.save({ validateBeforeSave: false })
    return res.send({ message: 'Account confirm' })
  } catch (e) {
    return res.status(500).send({ message: e })
  }
})

router.post('/', async (req, res) => {
  try {
    const secretToken = getLiveSecretCookie({ email: req.body.email })
    const { email, password, username } = req.body

    const userData = { email, password, username, confirmationCode: secretToken.token }

    const user = new User(userData)

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token

    await user.save()

    nodemailer.sendConfirmationCode(user.username, user.email, user.confirmationCode)

    return res.status(201).send(user)
  } catch (e) {
    return res.status(400).send(e)
  }
})

router.post('/sessions', async (req, res) => {
  try {
    if (req.cookies.jwt) {
      const user = await User.findOne({ token: req.cookies.jwt })
      return res.send(user)
    }

    if (!req.body.email || !req.body.password) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    if (user.authentication !== true) {
      return res.status(401).send({ message: 'Пожалуйста, подтвердите свою регистрацию на почте!' })
    }

    const isMatch = await user.checkPassword(req.body.password)
    if (!isMatch) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
    }

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token
    await user.save({ validateBeforeSave: false })

    return res.send(user)
  } catch (e) {
    return res.status(500).send({ error: e })
  }
})

module.exports = router