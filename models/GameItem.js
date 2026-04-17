const mongoose = require('mongoose');

const gameItemSchema = new mongoose.Schema({
  itemId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // например: 'letter_a', 'word_alma'
  type: { 
    type: String, 
    enum: ['letter', 'syllable', 'word', 'system'], 
    required: true 
  }, // Тип элемента для фильтрации по играм
  text: { 
    type: String, 
    required: true 
  }, // Само значение (А, ана, ба)
  audioPath: { 
    type: String, 
    required: false 
  } // Путь к файлу на фронтенде
}, { timestamps: true });

module.exports = mongoose.model('GameItem', gameItemSchema);