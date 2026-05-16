const projectRepo = require('../repositorios/proyecto.repositorio');
const postRepo = require('../repositorios/postulacion.repositorio');
const msgRepo = require('../repositorios/mensaje.repositorio');

async function listProjects(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.estado) filter.estado = query.estado;
  if (query.carrera) filter.carreras = query.carrera;
  if (query.buscar) filter.titulo = { $regex: query.buscar, $options: 'i' };

  const projects = await projectRepo.findAll(filter, skip, limit);
  const total = await projectRepo.count(filter);

  return {
    status: 200,
    body: {
      success: true,
      data: projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    }
  };
}

async function createProject(userId, data) {
  const { titulo, descripcion, carreras, cupoMaximo } = data;
  if (!titulo || !descripcion || !carreras || !cupoMaximo) {
    return { status: 400, body: { success: false, message: 'Faltan campos obligatorios' } };
  }

  const project = await projectRepo.createProject({
    titulo,
    descripcion,
    carreras,
    cupoMaximo,
    creador: userId
  });

  return { status: 201, body: { success: true, data: project } };
}

async function updateProject(proyecto, data) {
  const allowed = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    carreras: data.carreras,
    cupoMaximo: data.cupoMaximo,
    estado: data.estado
  };

  Object.keys(allowed).forEach(key => allowed[key] === undefined && delete allowed[key]);
  const updated = await projectRepo.updateById(proyecto._id, allowed);
  return { status: 200, body: { success: true, data: updated } };
}

async function deleteProject(proyecto) {
  await projectRepo.deleteById(proyecto._id);
  return { status: 200, body: { success: true, message: 'Proyecto eliminado' } };
}

async function applyToProject(userId, proyectoId) {
  const proyecto = await projectRepo.findById(proyectoId);
  if (!proyecto) {
    return { status: 404, body: { success: false, message: 'Proyecto no encontrado' } };
  }

  if (proyecto.creador._id.toString() === userId.toString()) {
    return { status: 400, body: { success: false, message: 'No puedes postularte a tu propio proyecto' } };
  }

  const postulacion = await postRepo.create({ proyecto: proyectoId, solicitante: userId });
  return { status: 201, body: { success: true, data: postulacion } };
}

async function updateApplicationStatus(proyecto, postulacionId, estado) {
  if (!['Aceptada', 'Rechazada'].includes(estado)) {
    return { status: 400, body: { success: false, message: 'Estado no válido' } };
  }

  const postulacion = await postRepo.findById(postulacionId);
  if (!postulacion || postulacion.proyecto._id.toString() !== proyecto._id.toString()) {
    return { status: 404, body: { success: false, message: 'Postulación no encontrada' } };
  }

  if (estado === 'Aceptada') {
    const aceptados = await postRepo.countAccepted(proyecto._id);
    if (aceptados >= proyecto.cupoMaximo) {
      return { status: 409, body: { success: false, message: 'El proyecto ya está lleno' } };
    }
  }

  const updated = await postRepo.updateStatus(postulacionId, estado);
  return { status: 200, body: { success: true, data: updated } };
}

async function listMessages(proyectoId) {
  const messages = await msgRepo.findByProject(proyectoId);
  return { status: 200, body: { success: true, data: messages } };
}

async function sendMessage(userId, proyectoId, contenido) {
  if (!contenido || contenido.trim() === '') {
    return { status: 400, body: { success: false, message: 'El mensaje no puede estar vacío' } };
  }

  const message = await msgRepo.create({ proyecto: proyectoId, remitente: userId, contenido });
  return { status: 201, body: { success: true, data: message } };
}

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  applyToProject,
  updateApplicationStatus,
  listMessages,
  sendMessage
};
