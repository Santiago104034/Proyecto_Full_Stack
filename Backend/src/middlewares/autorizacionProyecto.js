const Proyecto = require('../models/Proyecto');
const Postulacion = require('../models/Postulacion');

async function requireCreador(req, res, next) {
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  if (proyecto.creador.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Solo el creador puede hacer esto' });
  }

  req.proyecto = proyecto;
  next();
}

async function requireMiembroProyecto(req, res, next) {
  const proyectoId = req.params.id;
  const proyecto = await Proyecto.findById(proyectoId);

  if (!proyecto) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  const esCreador = proyecto.creador.toString() === req.user._id.toString();
  const postulacion = await Postulacion.findOne({
    proyecto: proyectoId,
    solicitante: req.user._id,
    estado: 'Aceptada'
  });

  if (!esCreador && !postulacion) {
    return res.status(403).json({ success: false, message: 'Solo miembros aceptados pueden entrar al chat' });
  }

  req.proyecto = proyecto;
  next();
}

module.exports = { requireCreador, requireMiembroProyecto };
