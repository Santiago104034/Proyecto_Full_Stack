# InterLink Estudiantil - Front-end

Front-end sencillo en HTML, CSS y JavaScript conectado al back-end desplegado en Render.

## API utilizada

https://backend-desarrollo-web-pntm.onrender.com

## Cómo correrlo

Opción recomendada:

1. Abrir la carpeta en VS Code.
2. Instalar la extensión Live Server.
3. Abrir `index.html`.
4. Clic derecho → Open with Live Server.

También puedes abrir `index.html` directamente en el navegador, pero Live Server evita problemas de carga.

## Credenciales

Puedes crear usuarios desde el registro. El correo debe terminar en `@iteso.mx`.

Ejemplos:

- victor@iteso.mx / 123456
- alumno2@iteso.mx / 123456

## Nota sobre cookies

Este front usa JWT en el header `Authorization: Bearer token` porque el back-end actual trabaja con JWT. La línea de Axios está así:

```js
axios.defaults.withCredentials = false;
```

Si se cambia el back-end a cookies, entonces se puede cambiar a:

```js
axios.defaults.withCredentials = true;
```

y también se debe configurar CORS con `credentials: true` en el back-end.
