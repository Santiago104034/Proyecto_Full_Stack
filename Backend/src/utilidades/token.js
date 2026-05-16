const jwt = require('jsonwebtoken');

function crearToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

module.exports = crearToken;
