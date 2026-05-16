const mongoose = require('mongoose');
const Carrera = require('../models/Carrera');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
    await Carrera.seedDefaultCarreras();
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
