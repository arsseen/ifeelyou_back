// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // POST /api/users (Авторизация/Регистрация через Firebase UID)
// router.post('/', async (req, res) => {
//   try {
//     const { uid, displayName, email, photoURL } = req.body;
//     let user = await User.findOne({ uid });

//     if (!user) {
//       user = new User({ uid, displayName, email, photoURL });
//       await user.save();
//     }
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Ошибка сервера');
//   }
// });

// // PUT /api/users/progress (Сохранение результатов игры)
// router.put('/progress', async (req, res) => {
//   try {
//     const { uid, gameType, itemId, xpGained, wpm } = req.body;
//     let user = await User.findOne({ uid });
    
//     if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

//     const updateField = `${gameType}sCompleted`; // lettersCompleted и т.д.
    
//     // Обновляем статистику
//     user.stats.totalXp += (xpGained || 10);
//     if (wpm && wpm > user.stats.bestWpm) user.stats.bestWpm = wpm;

//     // Обновляем график активности (Daily Progress)
//     const today = new Date().toISOString().split('T')[0];
//     const currentActivityCount = user.dailyActivity.get(today) || 0;
//     user.dailyActivity.set(today, currentActivityCount + 1);

//     // Добавляем пройденный элемент
//     if (!user.progress[updateField].includes(itemId)) {
//         user.progress[updateField].push(itemId);
//     }
    
//     // Проверка ачивки "Балапан" (прошел все 42 звука)
//     if (updateField === 'lettersCompleted' && user.progress.lettersCompleted.length === 42) {
//         const hasBalapan = user.achievements.some(a => a.id === 'balapan');
//         if (!hasBalapan) user.achievements.push({ id: 'balapan' });
//     }

//     await user.save();
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Ошибка сервера');
//   }
// });

// // GET /api/users/:uid (Получить профиль)
// router.get('/:uid', async (req, res) => {
//   try {
//     const user = await User.findOne({ uid: req.params.uid });
//     if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Ошибка сервера');
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users (Авторизация/Регистрация через Firebase UID)
router.post('/', async (req, res) => {
  try {
    const { uid, displayName, email, photoURL } = req.body;
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, displayName, email, photoURL });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// POST /api/users/progress (НОВАЯ УМНАЯ ЛОГИКА: Сохранение результатов и выдача ачивок)
router.post('/progress', async (req, res) => {
  try {
    // 1. Получаем данные от GameEngine.jsx
    const { uid, stage, correct, total } = req.body;
    
    // 2. Находим пользователя в базе
    let user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

    // 3. Начисляем опыт (например, 10 XP за каждый правильный ответ)
    const xpGained = correct * 10;
    user.stats.totalXp += xpGained;

    // Обновляем рекорд точности (если этот результат лучше старого)
    // Защита от деления на ноль, если total = 0
    if (total > 0) {
      const accuracy = Math.round((correct / total) * 100);
      if (accuracy > user.stats.accuracyRecord) {
          user.stats.accuracyRecord = accuracy;
      }
    }

    // 4. Обновляем ежедневную активность (для графиков)
    const today = new Date().toISOString().split('T')[0];
    const currentActivityCount = user.dailyActivity.get(today) || 0;
    user.dailyActivity.set(today, currentActivityCount + 1);

    // ==========================================
    // 5. МАГИЯ АЧИВОК (Проверяем условия)
    // ==========================================
    const newAchievements = []; 

    // Ачивка 1: "Ақылды түлкі" (Идеальный слух) — 100% правильных ответов
    if (correct === total && total > 0) {
        const hasPerfect = user.achievements.some(a => a.id === 'aqyldy_tulki');
        if (!hasPerfect) {
            user.achievements.push({ id: 'aqyldy_tulki' });
            newAchievements.push('aqyldy_tulki');
        }
    }

    // Ачивка 2: "Шапшаң қоян" (Опытный) — Набрал свои первые 200 XP
    if (user.stats.totalXp >= 200) {
        const hasRabbit = user.achievements.some(a => a.id === 'shapsan_koyan');
        if (!hasRabbit) {
            user.achievements.push({ id: 'shapsan_koyan' });
            newAchievements.push('shapsan_koyan');
        }
    }

    // Ачивка 3: "Балапан" (Первые шаги) — Выдаем за самую первую игру
    const hasBalapan = user.achievements.some(a => a.id === 'balapan');
    if (!hasBalapan) {
        user.achievements.push({ id: 'balapan' });
        newAchievements.push('balapan');
    }

    // 6. Сохраняем все изменения в базу данных
    await user.save();

    // 7. Отправляем ответ фронтенду
    res.status(200).json({
        success: true,
        xpGained: xpGained,
        newAchievements: newAchievements,
        stats: user.stats
    });

  } catch (err) {
    console.error('Ошибка сохранения прогресса:', err);
    res.status(500).send('Ошибка сервера');
  }
});

// GET /api/users/:uid (Получить профиль)
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;