const express = require('express');
const multer = require('multer');
const path = require('path');
const {nanoid} = require('nanoid');
const fs = require("fs");

const config = require('../config');
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, nanoid() + path.extname(file.originalname));
  },
});

const upload = multer({storage});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    return res.send(products);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).send({message: 'Product not found!'});
    }

    return res.send(product);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({message: "You not have right!"});
  }

  const {title, price, description} = req.body;

  if (!title || !price) {
    return res.status(400).send({error: 'Data not valid'});
  }

  const productData = {
    title,
    price,
    description: description || null,
    image: null,
  };

  if (req.file) {
    productData.image = 'uploads/' + req.file.filename;
  }

  try {
    const product = new Product(productData);
    await product.save();

    return res.send(product);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id

    if (req.user.role !== 'admin') {
      return res.status(403).send({message: "You not have right!"})
    }

    if (!id) {
      return res.status(400).send({error: 'Data not valid!'})
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).send({error: 'Product not found!'})
    }

    await Product.findByIdAndUpdate(id, {stock: !product.stock}, {new: true})

    return res.send({message: 'Данные обновлены'})
  } catch (e) {
    return res.status(500).send(e)
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({message: "Product not found!"});
    }

    if (req.user.role === 'admin') {
      await Product.deleteOne({_id: req.params.id});

      if (product?.image) {
        fs.unlink(`${config.uploadPath}/${product.image}`, err => {
          if (err) {
            console.log(err)
          }
        })
      }

      return res.send({message: 'Product deleted!'});
    }

    return res.status(403).send({message: "You not have right!"});
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;