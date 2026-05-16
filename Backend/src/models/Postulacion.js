const mongoose = require('mongoose');

const PostulacionSchema = new mongoose.Schema({
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  estado: { type: String, enum: ['Pendiente', 'Aceptada', 'Rechazada'], default: 'Pendiente' }
}, { timestamps: true });

PostulacionSchema.index({ proyecto: 1, solicitante: 1 }, { unique: true });

module.exports = mongoose.model('Postulacion', PostulacionSchema);
