const mongoose = require('mongoose');

const ComentarioInternoSchema = new mongoose.Schema({
  texto: { type: String, required: true, maxlength: 300 },
  fecha: { type: Date, default: Date.now }
}, { _id: false });

const ProyectoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  descripcion: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  carreras: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Carrera', required: true }],
  cupoMaximo: { type: Number, required: true, min: 1 },
  estado: { type: String, enum: ['Activo', 'En progreso', 'Finalizado'], default: 'Activo' },
  comentariosInternos: [ComentarioInternoSchema]
}, { timestamps: true });

ProyectoSchema.pre('save', function (next) {
  if (this.titulo) {
    this.titulo = this.titulo.trim();
  }
  next();
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);
