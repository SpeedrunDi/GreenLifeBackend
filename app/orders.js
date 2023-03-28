const express = require('express')
const axios = require("axios")
const Order = require('../models/Order')
const User = require("../models/User")
const config = require('../config')
const auth = require("../middleware/auth")

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const {status} = req.query
    const query = {user: req.user._id}
    if (req.user.role === 'admin') {
      delete query.user
    }

    if (status === 'active') {
      query.status = { $in: [1, 2] }
    } else if (status === 'closed') {
      query.status = 3
    }

    const orders = await Order.find(query).populate('products._id', 'title price').sort({status: 1})

    return res.send(orders)
  } catch (e) {
    return res.status(500).send(e)
  }
})

router.post('/', async (req, res) => {
  try {
    const token = req.query.token
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

    return res.send({message: "Данные успешно сохранены"})
  } catch (e) {
    return res.status(500).send(e)
  }
})

router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).send({error: 'У вас нет прав'})
    }

    const id = req.params.id
    const status = req.query.status

    if (!id) {
      return res.status(400).send({error: 'ID не передан'})
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.send(404).send({error: 'Заказ не найден!'})
    }

    await Order.findByIdAndUpdate(id, {status}, {new: true})

    return res.send({message: 'Данные успешно обновлены'})
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router