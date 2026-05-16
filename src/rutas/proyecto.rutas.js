const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); 
const { validarCampos } = require('../middlewares/validarCampos'); 

const { requireAuth } = require('../middlewares/autenticacion');
const { requireCreador, requireMiembroProyecto } = require('../middlewares/autorizacionProyecto');
const projectController = require('../controladores/proyecto.controlador');

router.get('/', requireAuth, projectController.listProjects);
router.get('/:id', requireAuth, projectController.getProject);

router.post('/', [
    requireAuth,
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('cupoMaximo', 'El cupo máximo debe ser un número').isInt({ min: 1 }),
    check('carreras', 'Debe ser un arreglo de carreras').isArray(),
    validarCampos
], projectController.createProject);

router.put('/:id', [
    requireAuth,
    requireCreador,
    check('titulo', 'El título no puede estar vacío').optional().not().isEmpty(),
    check('descripcion', 'La descripción no puede estar vacía').optional().not().isEmpty(),
    check('cupoMaximo', 'El cupo máximo debe ser un número').optional().isInt({ min: 1 }),
    validarCampos
], projectController.updateProject);

router.delete('/:id', requireAuth, requireCreador, projectController.deleteProject);

router.post('/:id/postulaciones', requireAuth, projectController.applyToProject);
router.get('/:id/postulaciones', requireAuth, requireCreador, projectController.getProjectApplications);
router.patch('/:id/postulaciones/:postulacionId', requireAuth, requireCreador, projectController.updateApplicationStatus);

router.get('/:id/mensajes', requireAuth, requireMiembroProyecto, projectController.listMessages);

router.post('/:id/mensajes', [
    requireAuth,
    requireMiembroProyecto,
    check('contenido', 'El mensaje no puede estar vacío').not().isEmpty(),
    validarCampos
], projectController.sendMessage);

module.exports = router;
