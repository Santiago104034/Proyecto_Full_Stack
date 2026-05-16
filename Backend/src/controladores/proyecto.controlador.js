const projectService = require('../servicios/proyecto.servicio');
const projectRepo = require('../repositorios/proyecto.repositorio');
const postRepo = require('../repositorios/postulacion.repositorio');

async function listProjects(req, res, next) {
  try {
    const result = await projectService.listProjects(req.query);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectRepo.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const result = await projectService.createProject(req.user._id, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const result = await projectService.updateProject(req.proyecto, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.proyecto);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function applyToProject(req, res, next) {
  try {
    const result = await projectService.applyToProject(req.user._id, req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function getProjectApplications(req, res, next) {
  try {
    const applications = await postRepo.findByProject(req.params.id);
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const result = await projectService.updateApplicationStatus(req.proyecto, req.params.postulacionId, req.body.estado);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const result = await projectService.listMessages(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const result = await projectService.sendMessage(req.user._id, req.params.id, req.body.contenido);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
  listMessages,
  sendMessage
};
