const express = require('express');
const router = express.Router();
const carreraController = require('../controladores/carrera.controlador');

// Esta ruta queda pública para poder obtener el id de carrera al registrarse.
router.get('/', carreraController.listCareers);

module.exports = router;
