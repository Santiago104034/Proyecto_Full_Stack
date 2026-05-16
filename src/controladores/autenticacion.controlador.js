const authService = require('../servicios/autenticacion.servicio');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    if (result.status === 201) {
      res.cookie('token', result.body.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 
      });
    }
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    if (result.status === 200) {
      res.cookie('token', result.body.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 
      });
    }
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function registerAdmin(req, res, next) {
  try {
    req.body.rol = 'administrador';
    const result = await authService.register(req.body);
    if (result.status === 201) {
      res.cookie('token', result.body.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
    }
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, registerAdmin };