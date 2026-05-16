const userRepo = require('../repositorios/usuario.repositorio');
const projectRepo = require('../repositorios/proyecto.repositorio');
const msgRepo = require('../repositorios/mensaje.repositorio');

async function listUsers(req, res, next) {
  try {
    const users = await userRepo.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

async function deleteAnyProject(req, res, next) {
  try {
    const project = await projectRepo.deleteById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    res.json({ success: true, message: 'Proyecto eliminado por administrador' });
  } catch (error) {
    next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const messages = await msgRepo.findAll();
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
}

async function deleteMessage(req, res, next) {
  try {
    const message = await msgRepo.deleteById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    res.json({ success: true, message: 'Mensaje eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, deleteAnyProject, listMessages, deleteMessage };
