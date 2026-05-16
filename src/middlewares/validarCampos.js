const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
  // validationResult junta todos los errores que encuentre la librería profe
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación en la información enviada',
      errors: errors.array() // Aquí le mandamos al front la lista exacta de qué falló
    });
  }
  next(); // Si no hay errores, deja pasar la petición al controlador
};

module.exports = { validarCampos };