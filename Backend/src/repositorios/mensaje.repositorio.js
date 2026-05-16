const Mensaje = require('../models/Mensaje');

function create(data) {
  return Mensaje.create(data);
}

function findByProject(proyectoId) {
  return Mensaje.find({ proyecto: proyectoId })
    .populate('remitente', 'nombre correo')
    .sort({ createdAt: 1 });
}

function deleteById(id) {
  return Mensaje.findByIdAndDelete(id);
}

function findAll() {
  return Mensaje.find().populate('remitente', 'nombre correo').populate('proyecto', 'titulo');
}

module.exports = { create, findByProject, deleteById, findAll };
