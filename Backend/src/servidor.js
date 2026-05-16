require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const connectDB = require('./configuracion/base-datos');

const authRoutes = require('./rutas/autenticacion.rutas');
const userRoutes = require('./rutas/usuario.rutas');
const projectRoutes = require('./rutas/proyecto.rutas');
const careerRoutes = require('./rutas/carrera.rutas');
const adminRoutes = require('./rutas/administrador.rutas');
const errorHandler = require('./middlewares/manejadorErrores');

const app = express();
connectDB();

app.use(cors({
  origin: true, 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API InterLink Estudiantil funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/proyectos', projectRoutes);
app.use('/api/carreras', careerRoutes);
app.use('/api/admin', adminRoutes);

try {
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.log('Swagger no cargado:', error.message);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));