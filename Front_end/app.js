const API_URL = 'https://proyecto-final-interlink.onrender.com';
axios.defaults.withCredentials = true;

let carreras = [];
let paginaActual = 1;
let totalPaginas = 1;
let vistaActual = 'proyectos';

function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function getAuthHeaders() {
  const t = getToken();
  return t ? { Authorization: 'Bearer ' + t } : {};
}

let toastTimer;
function showToast(texto, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = texto;
  el.className = `toast ${tipo} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}
function mostrarMensaje(texto) { showToast(texto, 'success'); }
function mostrarError(error) {
  const msg = error.response?.data?.message || error.message || 'Ocurrió un error';
  showToast(msg, 'error');
}

function irAVista(vista) {
  vistaActual = vista;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${vista}`);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-view="${vista}"]`);
  if (navEl) navEl.classList.add('active');

  const titulos = {
    proyectos: 'Explorar proyectos',
    crear: 'Nuevo proyecto',
    postulaciones: 'Mis postulaciones',
    admin: 'Panel de administrador'
  };
  document.getElementById('topbarTitle').textContent = titulos[vista] || 'InterLink';

  document.getElementById('sidebar').classList.remove('open');

  if (vista === 'postulaciones') cargarMisPostulaciones();
}

function mostrarAuthScreen() {
  document.getElementById('authScreen').classList.remove('oculto');
  document.getElementById('appScreen').classList.add('oculto');
}
function mostrarAppScreen() {
  document.getElementById('authScreen').classList.add('oculto');
  document.getElementById('appScreen').classList.remove('oculto');
}

async function cargarCarreras() {
  try {
    const res = await axios.get(`${API_URL}/api/carreras`);
    carreras = res.data.data || res.data || [];
    llenarSelect('registroCarrera', carreras, 'Selecciona tu carrera');
    llenarSelect('proyectoCarreras', carreras, null);
    llenarSelect('filtroCarrera', carreras, 'Todas las carreras');
  } catch (error) {
    const s = document.getElementById('registroCarrera');
    s.innerHTML = '<option value="">No se pudieron cargar carreras</option>';
  }
}

function llenarSelect(id, items, textoInicial) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = '';
  if (textoInicial !== null) {
    const opt = document.createElement('option');
    opt.value = ''; opt.textContent = textoInicial;
    select.appendChild(opt);
  }
  items.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c._id; opt.textContent = c.nombre;
    select.appendChild(opt);
  });
}

async function registrar(event) {
  event.preventDefault();
  const btn = event.target.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Creando cuenta...';
  try {
    const data = {
      nombre: document.getElementById('registroNombre').value.trim(),
      correo: document.getElementById('registroCorreo').value.trim(),
      contrasena: document.getElementById('registroContrasena').value.trim(),
      carrera: document.getElementById('registroCarrera').value
    };
    await axios.post(`${API_URL}/api/auth/register`, data);
    mostrarMensaje('Cuenta creada. Ahora inicia sesión.');
    document.getElementById('loginCorreo').value = data.correo;
    document.getElementById('loginContrasena').value = data.contrasena;
    event.target.reset();
    // Cambiar tab a login
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'login'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.dataset.tabContent === 'login'));
  } catch (error) {
    mostrarError(error);
  } finally {
    btn.disabled = false; btn.innerHTML = '<span>Crear cuenta</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>';
  }
}

async function login(event) {
  event.preventDefault();
  const btn = event.target.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Entrando...';
  try {
    const data = {
      correo: document.getElementById('loginCorreo').value.trim(),
      contrasena: document.getElementById('loginContrasena').value.trim()
    };
    const res = await axios.post(`${API_URL}/api/auth/login`, data);
    const token = res.data.token || res.data.data?.token;
    if (!token) { mostrarError({ message: 'No se recibió token.' }); return; }
    setToken(token);

    const perfilRes = await axios.get(`${API_URL}/api/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usuario = perfilRes.data.data || perfilRes.data.usuario || perfilRes.data;
    localStorage.setItem('usuario', JSON.stringify(usuario));

    mostrarMensaje('¡Bienvenido!');
    iniciarApp();
  } catch (error) {
    mostrarError(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Entrar</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }
}

async function cargarPerfil() {
  try {
    const res = await axios.get(`${API_URL}/api/usuarios/perfil`, { headers: getAuthHeaders() });
    const u = res.data.data || res.data.usuario || res.data;
    const nombre = u.nombre || 'Usuario';
    document.getElementById('sidebarNombre').textContent = nombre;
    document.getElementById('sidebarRol').textContent = u.rol || 'alumno';
    document.getElementById('avatarInitial').textContent = nombre.charAt(0).toUpperCase();
    localStorage.setItem('usuario', JSON.stringify(u));
  } catch (e) {}
}

async function crearProyecto(event) {
  event.preventDefault();
  const btn = event.target.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Publicando...';
  try {
    const carrerasSeleccionadas = Array.from(document.getElementById('proyectoCarreras').selectedOptions).map(o => o.value);
    const data = {
      titulo: document.getElementById('proyectoTitulo').value.trim(),
      descripcion: document.getElementById('proyectoDescripcion').value.trim(),
      carreras: carrerasSeleccionadas,
      cupoMaximo: Number(document.getElementById('proyectoCupo').value)
    };
    await axios.post(`${API_URL}/api/proyectos`, data, { headers: getAuthHeaders() });
    mostrarMensaje('Proyecto publicado correctamente.');
    event.target.reset();
    document.getElementById('proyectoCupo').value = 3;
    irAVista('proyectos');
    cargarProyectos();
  } catch (error) {
    mostrarError(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M12 5v14M5 12h14"/></svg> Publicar proyecto';
  }
}

async function cargarProyectos() {
  const limit = document.getElementById('filtroLimit')?.value || 5;
  const buscar = document.getElementById('filtroBuscar')?.value || '';
  const estado = document.getElementById('filtroEstado')?.value || '';
  const carrera = document.getElementById('filtroCarrera')?.value || '';

  const params = new URLSearchParams({ page: paginaActual, limit });
  if (buscar) params.append('buscar', buscar);
  if (estado) params.append('estado', estado);
  if (carrera) params.append('carrera', carrera);

  const lista = document.getElementById('proyectosLista');
  lista.innerHTML = renderSkeletons(3);

  try {
    const res = await axios.get(`${API_URL}/api/proyectos?${params.toString()}`, { headers: getAuthHeaders() });
    const proyectos = res.data.data || [];
    const pag = res.data.pagination || {};
    totalPaginas = pag.pages || 1;
    document.getElementById('pageInfo').textContent = `Página ${pag.page || paginaActual} de ${totalPaginas}`;
    renderProyectos(proyectos);
  } catch (error) {
    mostrarError(error);
    lista.innerHTML = '<div class="empty-state"><p>Error al cargar proyectos.</p></div>';
  }
}

function renderSkeletons(n) {
  return Array(n).fill(0).map(() => `
    <div class="proyecto-card">
      <div class="skeleton" style="height:20px;width:70%;margin-bottom:8px"></div>
      <div class="skeleton" style="height:14px;width:100%;margin-bottom:4px"></div>
      <div class="skeleton" style="height:14px;width:85%"></div>
    </div>
  `).join('');
}

function estadoBadge(estado) {
  const map = {
    'Activo': 'activo',
    'En progreso': 'progreso',
    'Finalizado': 'finalizado'
  };
  const cls = map[estado] || 'finalizado';
  return `<span class="estado-badge ${cls}">${estado}</span>`;
}

function renderProyectos(proyectos) {
  const cont = document.getElementById('proyectosLista');
  if (!proyectos.length) {
    cont.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      <p>No se encontraron proyectos.</p>
    </div>`;
    return;
  }

  cont.innerHTML = proyectos.map(p => {
    const carrerasHtml = (p.carreras || []).map(c => `<span class="carrera-chip">${c.nombre}</span>`).join('');
    return `
    <div class="proyecto-card" id="card-${p._id}">
      <div class="proyecto-card-header">
        <h3 class="proyecto-titulo">${p.titulo}</h3>
        ${estadoBadge(p.estado)}
      </div>
      <p class="proyecto-desc">${p.descripcion}</p>
      <div class="carreras-wrap">${carrerasHtml}</div>
      <div class="proyecto-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ${p.creador?.nombre || 'N/A'}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Cupo: ${p.cupoMaximo}
        </span>
      </div>
      <div class="card-actions">
        <button class="btn-primary compact" onclick="postularme('${p._id}')">Postularme</button>
        <button class="btn-outline" onclick="toggleExtra('${p._id}', 'postulaciones')">Postulaciones</button>
        <button class="btn-outline" onclick="toggleExtra('${p._id}', 'chat')">Chat</button>
        <button class="btn-danger" onclick="eliminarProyecto('${p._id}')">Eliminar</button>
      </div>
      <div class="card-extra" id="extra-${p._id}"></div>
    </div>
  `}).join('');
}

let extraState = {};
async function toggleExtra(id, tipo) {
  const extra = document.getElementById(`extra-${id}`);
  const key = `${id}-${tipo}`;
  if (extraState[key] && extra.classList.contains('open')) {
    extra.classList.remove('open');
    extraState[key] = false;
    return;
  }
  extraState = {};
  document.querySelectorAll('.card-extra').forEach(e => e.classList.remove('open'));
  extraState[key] = true;
  extra.classList.add('open');
  extra.innerHTML = '<div class="skeleton" style="height:80px;width:100%"></div>';
  if (tipo === 'postulaciones') await renderPostulacionesCard(id, extra);
  if (tipo === 'chat') await renderChatCard(id, extra);
}

async function renderPostulacionesCard(id, container) {
  try {
    const res = await axios.get(`${API_URL}/api/proyectos/${id}/postulaciones`, { headers: getAuthHeaders() });
    const posts = res.data.data || [];
    if (!posts.length) {
      container.innerHTML = '<p style="color:var(--text-3);font-size:13px">Sin postulaciones aún.</p>';
      return;
    }
    container.innerHTML = `<h4 style="font-size:13px;color:var(--text-2);margin-bottom:8px;font-family:var(--font-display)">Postulaciones recibidas</h4>` +
      posts.map(s => `
        <div class="postulacion-item">
          <span><strong>${s.solicitante?.nombre || s.usuario?.nombre || 'Alumno'}</strong> — ${s.estado}</span>
          <div style="display:flex;gap:6px">
            <button class="btn-outline" onclick="actualizarPostulacion('${id}','${s._id}','Aceptada')">Aceptar</button>
            <button class="btn-danger" style="font-size:12px;padding:6px 10px" onclick="actualizarPostulacion('${id}','${s._id}','Rechazada')">Rechazar</button>
          </div>
        </div>
      `).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--red);font-size:13px">Error al cargar postulaciones.</p>';
  }
}

async function renderChatCard(id, container) {
  try {
    const res = await axios.get(`${API_URL}/api/proyectos/${id}/mensajes`, { headers: getAuthHeaders() });
    const msgs = res.data.data || [];
    container.innerHTML = `
      <h4 style="font-size:13px;color:var(--text-2);margin-bottom:8px;font-family:var(--font-display)">Chat del proyecto</h4>
      <div class="mensajes-list" id="msgs-${id}">
        ${msgs.length ? msgs.map(m => `
          <div class="mensaje-item">
            <strong>${m.remitente?.nombre || 'Usuario'}</strong>: ${m.contenido}
          </div>`).join('') : '<p style="color:var(--text-3);font-size:13px">Sé el primero en escribir.</p>'}
      </div>
      <div class="mensaje-form">
        <input type="text" id="msg-input-${id}" placeholder="Escribe un mensaje..." />
        <button class="btn-primary compact" onclick="enviarMensaje('${id}')">Enviar</button>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<p style="color:var(--red);font-size:13px">Error al cargar mensajes.</p>';
  }
}

async function eliminarProyecto(id) {
  if (!confirm('¿Eliminar este proyecto?')) return;
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const ruta = usuario.rol === 'administrador'
      ? `${API_URL}/api/admin/proyectos/${id}`
      : `${API_URL}/api/proyectos/${id}`;
    await axios.delete(ruta, { headers: getAuthHeaders() });
    mostrarMensaje('Proyecto eliminado.');
    cargarProyectos();
  } catch (error) { mostrarError(error); }
}

async function postularme(id) {
  try {
    await axios.post(`${API_URL}/api/proyectos/${id}/postulaciones`, {}, { headers: getAuthHeaders() });
    mostrarMensaje('Postulación enviada.');
  } catch (error) { mostrarError(error); }
}

async function actualizarPostulacion(proyectoId, postulacionId, estado) {
  try {
    await axios.patch(`${API_URL}/api/proyectos/${proyectoId}/postulaciones/${postulacionId}`, { estado }, { headers: getAuthHeaders() });
    mostrarMensaje('Postulación actualizada.');
    toggleExtra(proyectoId, 'postulaciones');
    setTimeout(() => toggleExtra(proyectoId, 'postulaciones'), 100);
  } catch (error) { mostrarError(error); }
}

async function enviarMensaje(id) {
  const input = document.getElementById(`msg-input-${id}`);
  if (!input?.value.trim()) return;
  try {
    await axios.post(`${API_URL}/api/proyectos/${id}/mensajes`, { contenido: input.value }, { headers: getAuthHeaders() });
    input.value = '';
    await renderChatCard(id, document.getElementById(`extra-${id}`));
  } catch (error) { mostrarError(error); }
}

async function cargarMisPostulaciones() {
  const cont = document.getElementById('misPostulaciones');
  cont.innerHTML = '<div class="skeleton" style="height:80px;width:100%;margin-bottom:10px"></div>';
  try {
    const res = await axios.get(`${API_URL}/api/usuarios/mis-postulaciones`, { headers: getAuthHeaders() });
    const posts = res.data.data || [];
    if (!posts.length) {
      cont.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
        <p>Aún no te has postulado a ningún proyecto.</p>
      </div>`;
      return;
    }
    cont.innerHTML = posts.map(s => {
      const estadoClass = s.estado === 'Aceptada' ? 'activo' : s.estado === 'Rechazada' ? 'finalizado' : 'progreso';
      return `
      <div class="postulacion-card">
        <div>
          <div class="postulacion-card-title">${s.proyecto?.titulo || 'Proyecto'}</div>
          <div class="postulacion-card-sub">${s.proyecto?.descripcion?.slice(0,80) || ''}${s.proyecto?.descripcion?.length > 80 ? '...' : ''}</div>
        </div>
        <span class="estado-badge ${estadoClass}">${s.estado}</span>
      </div>`;
    }).join('');
  } catch (error) {
    mostrarError(error);
  }
}

async function cargarAdmin() {
  const panel = document.getElementById('adminPanel');
  panel.innerHTML = '<div class="skeleton" style="height:80px;width:100%;margin-bottom:10px"></div>';
  try {
    const res = await axios.get(`${API_URL}/api/admin/usuarios`, { headers: getAuthHeaders() });
    const usuarios = res.data.data || [];
    if (!usuarios.length) {
      panel.innerHTML = '<p style="color:var(--text-3)">No hay usuarios.</p>';
      return;
    }
    panel.innerHTML = usuarios.map(u => `
      <div class="usuario-card">
        <div class="avatar" style="background:linear-gradient(135deg,var(--accent),#9b93ff)">${(u.nombre || 'U').charAt(0)}</div>
        <div class="usuario-card-info">
          <div class="usuario-card-nombre">${u.nombre}</div>
          <div class="usuario-card-correo">${u.correo}</div>
        </div>
        <span class="rol-badge ${u.rol}">${u.rol}</span>
      </div>
    `).join('');
  } catch (error) {
    mostrarError(error);
    panel.innerHTML = '<p style="color:var(--red);font-size:14px">Solo disponible para administradores.</p>';
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  mostrarMensaje('Sesión cerrada.');
  setTimeout(mostrarAuthScreen, 400);
}

function iniciarApp() {
  mostrarAppScreen();
  cargarPerfil();
  cargarProyectos();
  irAVista('proyectos');
}

function actualizarVista() {
  if (getToken()) iniciarApp();
  else mostrarAuthScreen();
}

document.getElementById('registroForm').addEventListener('submit', registrar);
document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('proyectoForm').addEventListener('submit', crearProyecto);
document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
document.getElementById('filtrarBtn').addEventListener('click', () => { paginaActual = 1; cargarProyectos(); });
document.getElementById('prevPage').addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; cargarProyectos(); } });
document.getElementById('nextPage').addEventListener('click', () => { if (paginaActual < totalPaginas) { paginaActual++; cargarProyectos(); } });
document.getElementById('cargarAdminBtn').addEventListener('click', cargarAdmin);

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => irAVista(btn.dataset.view));
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.dataset.tabContent === target));
  });
});

document.getElementById('modalCloseBtn').addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.add('oculto');
});
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.add('oculto');
  }
});

document.getElementById('filtroBuscar').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { paginaActual = 1; cargarProyectos(); }
});

cargarCarreras();
actualizarVista();
