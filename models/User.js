const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Уникальный ID, который выдаст Firebase/Google Auth
  displayName: { type: String, required: true },
  email: { type: String },
  photoURL: { type: String },
  
  stats: {
    totalXp: { type: Number, default: 0 }, // Общий опыт/очки
    bestWpm: { type: Number, default: 0 }, // Лучшая скорость (слов в минуту)
    accuracyRecord: { type: Number, default: 0 }
  },
  
  progress: {
    // Храним ID пройденных элементов (например: ['letter_a', 'letter_b'])
    lettersCompleted: [{ type: String }], 
    syllablesCompleted: [{ type: String }],
    wordsCompleted: [{ type: String }]
  },
  
  achievements: [{
    id: { type: String }, // Например: "shapsan_koyan", "dana_uki"
    earnedAt: { type: Date, default: Date.now }
  }],
  
  dailyActivity: {
    // Формат "ГГГГ-ММ-ДД" и количество действий за этот день
    type: Map,
    of: Number, 
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);