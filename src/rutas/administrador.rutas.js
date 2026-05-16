const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/autenticacion');
const adminController = require('../controladores/administrador.controlador');
const authController = require('../controladores/autenticacion.controlador');

router.use(requireAuth, requireRole('administrador'));

router.post('/crear-admin', authController.registerAdmin);

router.get('/usuarios', adminController.listUsers);
router.delete('/proyectos/:id', adminController.deleteAnyProject);
router.get('/mensajes', adminController.listMessages);
router.delete('/mensajes/:id', adminController.deleteMessage);

module.exports = router;
