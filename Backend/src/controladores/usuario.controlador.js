const userRepo = require('../repositorios/usuario.repositorio');
const postRepo = require('../repositorios/postulacion.repositorio');

async function getProfile(req, res, next) {
  try {
    const user = await userRepo.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function getMyApplications(req, res, next) {
  try {
    const applications = await postRepo.findByUser(req.user._id);
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, getMyApplications };
