const mongoose = require('mongoose');

const CarreraSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });

CarreraSchema.statics.seedDefaultCarreras = async function () {
  const total = await this.countDocuments();
  if (total > 0) return;

  await this.insertMany([
    { nombre: 'Ingeniería en Sistemas' },
    { nombre: 'Diseño Gráfico' },
    { nombre: 'Administración' },
    { nombre: 'Mercadotecnia' },
    { nombre: 'Ingeniería Industrial' }
  ]);

  console.log('Carreras iniciales creadas');
};

module.exports = mongoose.model('Carrera', CarreraSchema);
