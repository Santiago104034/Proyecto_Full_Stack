const API_URL = 'https://backend-desarrollo-web-pntm.onrender.com';

// Tu backend actual usa JWT por header. Por eso se deja false.
// Si en otra versión usan cookies, cambiar a true y configurar CORS credentials en el backend.
axios.defaults.withCredentials = false;

document.getElementById('apiText').textContent = API_URL;

let carreras = [];
let paginaActual = 1;
let totalPaginas = 1;

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: 'Bearer ' + token } : {};
}

function mostrarMensaje(texto, esError = false) {
  const box = document.getElementById('mensaje');
  box.textContent = texto;
  box.className = esError ? 'mensaje error' : 'mensaje';
  setTimeout(() => box.classList.add('oculto'), 4500);
}

function mostrarError(error) {
  const mensaje = error.response?.data?.message || error.message || 'Ocurrió un error';
  mostrarMensaje(mensaje, true);
}

function actualizarVista() {
  const tieneToken = !!getToken();
  document.getElementById('authSection').classList.toggle('oculto', tieneToken);
  document.getElementById('appSection').classList.toggle('oculto', !tieneToken);

  const nav = document.getElementById('nav');
  nav.innerHTML = tieneToken ? '<button onclick="cerrarSesion()">Cerrar sesión</button>' : '';

  if (tieneToken) {
    cargarPerfil();
    cargarProyectos();
    cargarMisPostulaciones();
  }
}

async function cargarCarreras() {
  try {
    const res = await axios.get(`${API_URL}/api/carreras`);
    carreras = res.data.data || res.data || [];

    llenarSelect('registroCarrera', carreras, 'Seleccione una carrera');
    llenarSelect('proyectoCarreras', carreras, null);
    llenarSelect('filtroCarrera', carreras, 'Todas');
  } catch (error) {
    mostrarError(error);
    const select = document.getElementById('registroCarrera');
    select.innerHTML = '<option value="">No se pudieron cargar carreras</option>';
  }
}

function llenarSelect(id, items, textoInicial) {
  const select = document.getElementById(id);
  select.innerHTML = '';

  if (textoInicial !== null) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = textoInicial;
    select.appendChild(option);
  }

  items.forEach(carrera => {
    const option = document.createElement('option');
    option.value = carrera._id;
    option.textContent = carrera.nombre;
    select.appendChild(option);
  });
}

async function registrar(event) {
  event.preventDefault();
  try {
    const data = {
      nombre: document.getElementById('registroNombre').value.trim(),
      correo: document.getElementById('registroCorreo').value.trim(),
      contrasena: document.getElementById('registroContrasena').value.trim(),
      carrera: document.getElementById('registroCarrera').value
    };

    await axios.post(`${API_URL}/api/auth/register`, data);
    mostrarMensaje('Usuario registrado correctamente. Ahora inicia sesión.');
    document.getElementById('loginCorreo').value = data.correo;
    document.getElementById('loginContrasena').value = data.contrasena;
    event.target.reset();
  } catch (error) {
    mostrarError(error);
  }
}

async function login(event) {
  event.preventDefault();

  try {
    const data = {
      correo: document.getElementById('loginCorreo').value.trim(),
      contrasena: document.getElementById('loginContrasena').value.trim()
    };

    const res = await axios.post(`${API_URL}/api/auth/login`, data);
    const token = res.data.token || res.data.data?.token;

    if (!token) {
      mostrarMensaje('Login correcto, pero no se recibió token.', true);
      return;
    }

    setToken(token);

    const perfilRes = await axios.get(`${API_URL}/api/usuarios/perfil`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const usuario = perfilRes.data.data || perfilRes.data.usuario || perfilRes.data;
    localStorage.setItem('usuario', JSON.stringify(usuario));

    mostrarMensaje('Sesión iniciada correctamente.');
    actualizarVista();

  } catch (error) {
    mostrarError(error);
  }
}

async function cargarPerfil() {
  try {
    const res = await axios.get(`${API_URL}/api/usuarios/perfil`, { headers: getAuthHeaders() });
    const u = res.data.data || res.data.usuario || res.data;
    document.getElementById('perfilTexto').innerHTML = `
      <strong>${u.nombre || 'Usuario'}</strong><br>
      ${u.correo || ''}<br>
      Rol: ${u.rol || 'alumno'}
    `;
  } catch (error) {
    mostrarError(error);
  }
}

async function crearProyecto(event) {
  event.preventDefault();
  try {
    const carrerasSeleccionadas = Array.from(document.getElementById('proyectoCarreras').selectedOptions).map(o => o.value);

    const data = {
      titulo: document.getElementById('proyectoTitulo').value.trim(),
      descripcion: document.getElementById('proyectoDescripcion').value.trim(),
      carreras: carrerasSeleccionadas,
      cupoMaximo: Number(document.getElementById('proyectoCupo').value)
    };

    await axios.post(`${API_URL}/api/proyectos`, data, { headers: getAuthHeaders() });
    mostrarMensaje('Proyecto creado correctamente.');
    event.target.reset();
    document.getElementById('proyectoCupo').value = 3;
    cargarProyectos();
  } catch (error) {
    mostrarError(error);
  }
}

async function cargarProyectos() {
  try {
    const limit = document.getElementById('filtroLimit')?.value || 5;
    const buscar = document.getElementById('filtroBuscar')?.value || '';
    const estado = document.getElementById('filtroEstado')?.value || '';
    const carrera = document.getElementById('filtroCarrera')?.value || '';

    const params = new URLSearchParams({ page: paginaActual, limit });
    if (buscar) params.append('buscar', buscar);
    if (estado) params.append('estado', estado);
    if (carrera) params.append('carrera', carrera);

    const res = await axios.get(`${API_URL}/api/proyectos?${params.toString()}`, { headers: getAuthHeaders() });
    const proyectos = res.data.data || [];
    const pag = res.data.pagination || {};
    totalPaginas = pag.pages || 1;

    document.getElementById('pageInfo').textContent = `Página ${pag.page || paginaActual} de ${totalPaginas}`;
    renderProyectos(proyectos);
  } catch (error) {
    mostrarError(error);
  }
}

function renderProyectos(proyectos) {
  const cont = document.getElementById('proyectosLista');
  cont.innerHTML = '';

  if (!proyectos.length) {
    cont.innerHTML = '<p>No se encontraron proyectos.</p>';
    return;
  }

  proyectos.forEach(p => {
    const div = document.createElement('div');
    div.className = 'proyecto';
    div.innerHTML = `
      <h3>${p.titulo}</h3>
      <p>${p.descripcion}</p>
      <p><strong>Creador:</strong> ${p.creador?.nombre || 'N/A'}</p>
      <p><strong>Estado:</strong> ${p.estado}</p>
      <p><strong>Cupo máximo:</strong> ${p.cupoMaximo}</p>
      <div>${(p.carreras || []).map(c => `<span class="badge">${c.nombre}</span>`).join('')}</div>
      <div class="actions">
        <button onclick="postularme('${p._id}')">Postularme</button>
        <button onclick="verPostulacionesProyecto('${p._id}')" class="outline">Ver postulaciones</button>
        <button onclick="cargarMensajes('${p._id}')" class="outline">Ver chat</button>
        <button onclick="eliminarProyecto('${p._id}')" class="danger">Eliminar</button>
      </div>
      <div id="extra-${p._id}"></div>
    `;
    cont.appendChild(div);
  });
}

async function eliminarProyecto(id) {
  if (!confirm('¿Eliminar proyecto?')) return;

  try {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    let usuario = null;

    if (usuarioGuardado) {
      usuario = JSON.parse(usuarioGuardado);
    }

    let ruta;

    if (usuario && usuario.rol === 'administrador') {
      ruta = `${API_URL}/api/admin/proyectos/${id}`;
    } else {
      ruta = `${API_URL}/api/proyectos/${id}`;
    }

    await axios.delete(ruta, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    mostrarMensaje('Proyecto eliminado correctamente.');
    cargarProyectos();

  } catch (error) {
    mostrarError(error);
  }
}

async function postularme(id) {
  try {
    await axios.post(`${API_URL}/api/proyectos/${id}/postulaciones`, {}, { headers: getAuthHeaders() });
    mostrarMensaje('Postulación enviada correctamente.');
    cargarMisPostulaciones();
  } catch (error) {
    mostrarError(error);
  }
}

async function cargarMisPostulaciones() {
  try {
    const res = await axios.get(`${API_URL}/api/usuarios/mis-postulaciones`, { headers: getAuthHeaders() });
    const postulaciones = res.data.data || [];
    const cont = document.getElementById('misPostulaciones');

    if (!postulaciones.length) {
      cont.innerHTML = '<p>No tienes postulaciones.</p>';
      return;
    }

    cont.innerHTML = postulaciones.map(s => `
      <div class="proyecto">
        <strong>${s.proyecto?.titulo || 'Proyecto'}</strong><br>
        Estado: <span class="badge">${s.estado}</span>
      </div>
    `).join('');
  } catch (error) {
    mostrarError(error);
  }
}

async function verPostulacionesProyecto(id) {
  try {
    const res = await axios.get(`${API_URL}/api/proyectos/${id}/postulaciones`, { headers: getAuthHeaders() });
    const postulaciones = res.data.data || [];
    const extra = document.getElementById(`extra-${id}`);

    if (!postulaciones.length) {
      extra.innerHTML = '<p>No hay postulaciones para este proyecto.</p>';
      return;
    }

    extra.innerHTML = '<h4>Postulaciones recibidas</h4>' + postulaciones.map(s => `
      <div class="proyecto">
        <strong>${s.solicitante?.nombre || s.usuario?.nombre || 'Alumno'}</strong><br>
        Estado: ${s.estado}
        <div class="actions">
          <button onclick="actualizarPostulacion('${id}', '${s._id}', 'Aceptada')">Aceptar</button>
          <button onclick="actualizarPostulacion('${id}', '${s._id}', 'Rechazada')" class="danger">Rechazar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    mostrarError(error);
  }
}

async function actualizarPostulacion(proyectoId, postulacionId, estado) {
  try {
    await axios.patch(`${API_URL}/api/proyectos/${proyectoId}/postulaciones/${postulacionId}`, { estado }, { headers: getAuthHeaders() });
    mostrarMensaje('Postulación actualizada.');
    verPostulacionesProyecto(proyectoId);
  } catch (error) {
    mostrarError(error);
  }
}

async function cargarMensajes(id) {
  try {
    const res = await axios.get(`${API_URL}/api/proyectos/${id}/mensajes`, { headers: getAuthHeaders() });
    const mensajes = res.data.data || [];
    const extra = document.getElementById(`extra-${id}`);
    extra.innerHTML = `
      <h4>Chat</h4>
      <div>${mensajes.map(m => `<p><strong>${m.remitente?.nombre || 'Usuario'}:</strong> ${m.contenido}</p>`).join('') || '<p>No hay mensajes.</p>'}</div>
      <form onsubmit="enviarMensaje(event, '${id}')">
        <input type="text" id="mensaje-${id}" placeholder="Escribe un mensaje" required />
        <button type="submit">Enviar</button>
      </form>
    `;
  } catch (error) {
    mostrarError(error);
  }
}

async function enviarMensaje(event, id) {
  event.preventDefault();
  try {
    const input = document.getElementById(`mensaje-${id}`);
    await axios.post(`${API_URL}/api/proyectos/${id}/mensajes`, { contenido: input.value }, { headers: getAuthHeaders() });
    input.value = '';
    cargarMensajes(id);
  } catch (error) {
    mostrarError(error);
  }
}

async function cargarAdmin() {
  try {
    const res = await axios.get(`${API_URL}/api/admin/usuarios`, { headers: getAuthHeaders() });
    const usuarios = res.data.data || [];
    document.getElementById('adminPanel').innerHTML = '<pre>' + JSON.stringify(usuarios, null, 2) + '</pre>';
  } catch (error) {
    mostrarError(error);
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  mostrarMensaje('Sesión cerrada.');
  actualizarVista();
}

document.getElementById('registroForm').addEventListener('submit', registrar);
document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('proyectoForm').addEventListener('submit', crearProyecto);
document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
document.getElementById('filtrarBtn').addEventListener('click', () => { paginaActual = 1; cargarProyectos(); });
document.getElementById('prevPage').addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; cargarProyectos(); } });
document.getElementById('nextPage').addEventListener('click', () => { if (paginaActual < totalPaginas) { paginaActual++; cargarProyectos(); } });
document.getElementById('cargarAdminBtn').addEventListener('click', cargarAdmin);

cargarCarreras();
actualizarVista();
