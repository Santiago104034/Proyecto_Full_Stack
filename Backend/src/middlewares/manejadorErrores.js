function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: 'El registro ya existe' });
  }

  res.status(500).json({ success: false, message: 'Error interno del servidor' });
}

module.exports = errorHandler;
