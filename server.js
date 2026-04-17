const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
connectDB(); // Подключаем базу

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Подключаем наши маршруты
app.use('/api/users', require('./routes/users'));
app.use('/api/game-items', require('./routes/gameItems'));
app.use('/api/feedback', require('./routes/feedback'));

const PORT = process.env.PORT || 5001;

// --- СХЕМА ПРОГРЕССА (Добавь после других схем, если они есть) ---
const mongoose = require('mongoose'); // Убедись, что mongoose подключен

const progressSchema = new mongoose.Schema({
  uid: { type: String, required: true },       // ID пользователя из Firebase
  stage: { type: Number, required: true },     // Какой этап играл (1, 2 или 3)
  correct: { type: Number, required: true },   // Сколько правильных ответов
  total: { type: Number, required: true },     // Сколько всего было вопросов
  createdAt: { type: Date, default: Date.now } // Дата игры
});

const Progress = mongoose.model('Progress', progressSchema);

// --- API РОУТЫ ДЛЯ ПРОГРЕССА ---

// 1. Сохранить результат игры (Вызывается в конце Кезең)
app.post('/api/progress', async (req, res) => {
  try {
    const newProgress = new Progress(req.body);
    await newProgress.save();
    res.status(200).json({ success: true, message: 'Прогресс сақталды!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Получить всю историю игр конкретного юзера (Для графиков)
app.get('/api/progress/:uid', async (req, res) => {
  try {
    // Ищем все записи юзера и сортируем по дате (старые -> новые)
    const history = await Progress.find({ uid: req.params.uid }).sort({ createdAt: 1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Бэкенд I Feel You запущен на порту ${PORT} 🚀`);
});