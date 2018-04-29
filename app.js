const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// Conectar a la base de datos
mongoose.connect(config.database);

// Mostrar mensaje de conexión exitosa con la base de datos
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database);
});

// Mostrar un mensaje de error si falla la conexión con la base de datos
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+err);
});

const app = express();

const users = require('./routes/users');
const articles = require('./routes/articles/articles');


const port = 3000;

app.use(cors());

// Asignar carpeta estática --> Middleware para Archivos que no cambian
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);
app.use('/articles', articles);

app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

// Iniciar servidor
app.listen(port, () => {
  console.log('Server started on port '+port);
});
