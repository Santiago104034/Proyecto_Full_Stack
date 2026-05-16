const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/autenticacion');
const userController = require('../controladores/usuario.controlador');

router.get('/perfil', requireAuth, userController.getProfile);
router.get('/mis-postulaciones', requireAuth, userController.getMyApplications);

module.exports = router;
