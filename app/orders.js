const express = require('express')
const axios = require("axios");
const Order = require('../models/Order')
const config = require('../config')
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const query = {user: req.user._id}
    if (req.user.role === 'admin') {
      delete query.user
    }

    const orders = await Order.find(query).populate('products._id', 'title price')

    return res.send(orders.reverse())
  } catch (e) {
    return res.status(500).send(e)
  }
})

router.post('/', async (req, res) => {
  try {
    const token = req.cookies.greenlife
    let user = null

    if (token) {
      user = await User.findOne({ token })
    }

    if (!req.body?.name || !req.body?.phone) {
      return res.status(400).send({error: "не верные данные"})
    }

    if (req.body.products?.length === 0) {
      return res.status(400).send({error: "не верные данные"})
    }

    const orderData = {
      clientName: req.body.name,
      phone: req.body.phone,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
      user: user || null
    }

    const order = new Order(orderData)
    await order.save()

    const uri_bot = `https://api.telegram.org/bot${config?.telegram?.token}/sendMessage`

    let message = `<b>Заказ</b>
    <b>Отправитель</b>: ${order.clientName}
    <b>Телефон</b>: ${order.phone}
    <b>Товары</b>:
    ${orderData.products.map(product => (
      `<b>
        Товар: ${product.title}
        кол-во: ${product.count}
</b>`
    ))}
    <b>Стоимость</b>: ${order.totalPrice}`

    await axios.post(uri_bot, {
      chat_id: config.telegram.chatId,
      parse_mode: 'html',
      text: message,
      disable_notification: false
    })

    return res.send({message: "данные успешно сохранены"})
  } catch (e) {
    return res.status(500).send(e)
  }
})

module.exports = router