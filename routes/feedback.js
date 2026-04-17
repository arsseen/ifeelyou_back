const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newFeedback = new Feedback({ name, email, subject, message });
    await newFeedback.save();
    res.status(201).json({ msg: 'Сообщение успешно отправлено!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;