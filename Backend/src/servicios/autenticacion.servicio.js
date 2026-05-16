const userRepo = require('../repositorios/usuario.repositorio');
const Carrera = require('../models/Carrera');
const crearToken = require('../utilidades/token');

function validarDominioCorreo(correo) {
  const dominio = process.env.ALLOWED_EMAIL_DOMAIN || 'universidad.mx';
  return correo.endsWith('@' + dominio);
}

async function register(data) {
  const { nombre, correo, contrasena, carrera } = data;

  if (!nombre || !correo || !contrasena || !carrera) {
    return { status: 400, body: { success: false, message: 'Faltan campos obligatorios' } };
  }

  if (!validarDominioCorreo(correo)) {
    return { status: 400, body: { success: false, message: 'Solo se permiten correos institucionales' } };
  }

  const carreraExiste = await Carrera.findById(carrera);
  if (!carreraExiste) {
    return { status: 400, body: { success: false, message: 'La carrera no existe' } };
  }

  const existe = await userRepo.findByEmail(correo);
  if (existe) {
    return { status: 400, body: { success: false, message: 'El correo ya está registrado' } };
  }

  const usuario = await userRepo.createUser({ nombre, correo, contrasena, carrera });
  const token = crearToken(usuario);
  return { status: 201, body: { success: true, data: { usuario, token } } };
}

async function login(data) {
  const { correo, contrasena } = data;
  if (!correo || !contrasena) {
    return { status: 400, body: { success: false, message: 'Correo y contraseña son obligatorios' } };
  }

  const usuario = await userRepo.findByEmail(correo);
  if (!usuario) {
    return { status: 401, body: { success: false, message: 'Correo o contraseña incorrectos' } };
  }

  const passwordOk = await usuario.compararContrasena(contrasena);
  if (!passwordOk) {
    return { status: 401, body: { success: false, message: 'Correo o contraseña incorrectos' } };
  }

  const token = crearToken(usuario);
  return { status: 200, body: { success: true, data: { usuario, token } } };
}

module.exports = { register, login };
