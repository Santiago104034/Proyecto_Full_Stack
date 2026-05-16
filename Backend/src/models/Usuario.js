const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, minlength: 3 },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  contrasena: { type: String, required: true, minlength: 6 },
  carrera: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrera', required: true },
  rol: { type: String, enum: ['alumno', 'administrador'], default: 'alumno' }
}, { timestamps: true });

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

UsuarioSchema.methods.compararContrasena = function (contrasena) {
  return bcrypt.compare(contrasena, this.contrasena);
};

UsuarioSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.contrasena;
  return user;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
