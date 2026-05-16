const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  remitente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  contenido: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

MensajeSchema.pre('save', function (next) {
  this.contenido = this.contenido.trim();
  next();
});

module.exports = mongoose.model('Mensaje', MensajeSchema);
