# Tabla de Estado de la API

| Método | Ruta | Descripción | ¿Completado? | Auth requerida | Cambios/Notas |
|---|---|---|---|---|---|
| POST | /api/auth/register | Registro de usuario | Sí | No | Valida correo institucional y carrera |
| POST | /api/auth/login | Inicio de sesión | Sí | No | Retorna JWT |
| GET | /api/carreras | Listar carreras | Sí | Sí | Carreras precargadas automáticamente |
| GET | /api/usuarios/perfil | Ver perfil | Sí | Sí | No retorna contraseña |
| GET | /api/usuarios/mis-postulaciones | Ver mis postulaciones | Sí | Sí | Usa populate con proyecto |
| GET | /api/proyectos | Listar proyectos | Sí | Sí | Soporta page, limit, estado, carrera y buscar |
| GET | /api/proyectos/:id | Detalle de proyecto | Sí | Sí | Usa populate |
| POST | /api/proyectos | Crear proyecto | Sí | Sí | Agrega cupoMaximo y carreras |
| PUT | /api/proyectos/:id | Editar proyecto | Sí | Sí | Solo creador |
| DELETE | /api/proyectos/:id | Eliminar proyecto | Sí | Sí | Solo creador |
| POST | /api/proyectos/:id/postulaciones | Postularse | Sí | Sí | Evita postularse al propio proyecto |
| GET | /api/proyectos/:id/postulaciones | Ver postulaciones | Sí | Sí | Solo creador |
| PATCH | /api/proyectos/:id/postulaciones/:postulacionId | Aceptar/Rechazar | Sí | Sí | Verifica cupo máximo |
| GET | /api/proyectos/:id/mensajes | Ver chat | Sí | Sí | Solo creador o alumno aceptado |
| POST | /api/proyectos/:id/mensajes | Enviar mensaje | Sí | Sí | Solo creador o alumno aceptado |
| GET | /api/admin/usuarios | Listar usuarios | Sí | Sí/Admin | Solo administrador |
| DELETE | /api/admin/proyectos/:id | Eliminar cualquier proyecto | Sí | Sí/Admin | Moderación |
| GET | /api/admin/mensajes | Listar mensajes | Sí | Sí/Admin | Moderación |
| DELETE | /api/admin/mensajes/:id | Eliminar mensaje | Sí | Sí/Admin | Moderación |
