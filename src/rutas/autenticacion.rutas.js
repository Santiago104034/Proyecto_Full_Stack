const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); 
const { validarCampos } = require('../middlewares/validarCampos'); 
const authController = require('../controladores/autenticacion.controlador');

router.post('/register', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'Debe ser un correo válido').isEmail(),
    check('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('carrera', 'La carrera es obligatoria').not().isEmpty(),
    validarCampos 
], authController.register);

router.post('/login', [
    check('correo', 'Debe ser un correo válido').isEmail(),
    check('contrasena', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], authController.login);

module.exports = router;