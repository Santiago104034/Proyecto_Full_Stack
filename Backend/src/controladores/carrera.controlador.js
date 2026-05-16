const Carrera = require('../models/Carrera');

async function listCareers(req, res, next) {
  try {
    const careers = await Carrera.find().sort({ nombre: 1 });
    res.json({ success: true, data: careers });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCareers };
