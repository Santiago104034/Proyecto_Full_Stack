const Postulacion = require('../models/Postulacion');

function create(data) {
  return Postulacion.create(data);
}

function findById(id) {
  return Postulacion.findById(id).populate('solicitante', 'nombre correo').populate('proyecto');
}

function findByProject(proyectoId) {
  return Postulacion.find({ proyecto: proyectoId }).populate('solicitante', 'nombre correo');
}

function findByUser(userId) {
  return Postulacion.find({ solicitante: userId }).populate('proyecto');
}

function updateStatus(id, estado) {
  return Postulacion.findByIdAndUpdate(id, { estado }, { new: true, runValidators: true });
}

function countAccepted(proyectoId) {
  return Postulacion.countDocuments({ proyecto: proyectoId, estado: 'Aceptada' });
}

module.exports = { create, findById, findByProject, findByUser, updateStatus, countAccepted };
