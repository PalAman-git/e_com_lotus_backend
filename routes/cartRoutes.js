const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();


router.post("/add", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const existingCartItem = await Cart.findOne({ productId });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      res.status(200).json(existingCartItem);
    } else {
      const cartItem = new Cart({ productId, quantity });
      await cartItem.save();
      res.status(201).json(cartItem);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete("/remove/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const cartItems = await Cart.find().populate("productId");
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );
    const discount = calculateDiscount(totalPrice);
    res.json({
      cartItems,
      totalPrice,
      discount,
      finalPrice: totalPrice - discount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const calculateDiscount = (totalPrice) => {
  if (totalPrice > 5000) return totalPrice * 0.2;
  if (totalPrice > 1000) return totalPrice * 0.1;
  return 0;
};

module.exports = router;
