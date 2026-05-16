const Usuario = require('../models/Usuario');

function createUser(data) {
  return Usuario.create(data);
}

function findByEmail(correo) {
  return Usuario.findOne({ correo }).populate('carrera');
}

function findById(id) {
  return Usuario.findById(id).select('-contrasena').populate('carrera');
}

function findAll() {
  return Usuario.find().select('-contrasena').populate('carrera');
}

module.exports = { createUser, findByEmail, findById, findAll };
