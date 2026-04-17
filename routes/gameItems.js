const express = require('express');
const router = express.Router();
const GameItem = require('../models/GameItem');

// GET /api/game-items?type=letter
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.type = type;

    const items = await GameItem.find(query);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;