const Proyecto = require('../models/Proyecto');

function createProject(data) {
  return Proyecto.create(data);
}

function findById(id) {
  return Proyecto.findById(id).populate('creador', 'nombre correo').populate('carreras');
}

function findAll(filter, skip, limit) {
  return Proyecto.find(filter)
    .populate('creador', 'nombre correo')
    .populate('carreras')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
}

function count(filter) {
  return Proyecto.countDocuments(filter);
}

function updateById(id, data) {
  return Proyecto.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

function deleteById(id) {
  return Proyecto.findByIdAndDelete(id);
}

module.exports = { createProject, findById, findAll, count, updateById, deleteById };
