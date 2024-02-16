const mysql = require ('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const ejs = require('ejs');
var fs = require ('fs');

const app = express();
const port = 3000;

let ultimaFoto = null;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `foto_${timestamp}.png`;
        ultimaFoto = filename;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'karting',
    multipleStatements: true  
});

db.connect((err)=> {
    if(!err)
    console.log('Conexion bbdd correcta...');
    else
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
    const { nombre, apellidos, email, telefono, dni } = req.body;

    if (!nombre || !apellidos || !email || !telefono || !dni) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const sql = `INSERT INTO usuarios (nombre, apellidos, email, telefono, dni) VALUES (?, ?, ?, ?, ?)`;
    const values = [nombre, apellidos, email, telefono, dni];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            return res.status(500).send('Error interno del servidor');
        } else {
            console.log('Usuario registrado exitosamente');
            return res.status(200).send('Usuario registrado exitosamente');
        }
    });
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
    const { dni } = req.body;

    const sql = `SELECT tiempo FROM tiempos WHERE dni = ? LIMIT 999`;
    const values = [dni];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            if (results.length > 0) {
                const tiempos = results.map(result => result.tiempo);
                const mensaje = `Tus tiempos son: ${tiempos.join(', ')}`;
                console.log('Inicio de sesión exitoso.');
                res.send(mensaje);
            } else {
                console.log('DNI no encontrado en la tabla tiempos');
                res.status(404).send('DNI no encontrado en la tabla tiempos');
            }
        }
    });
});

app.get('/foto', (req, res) => {
    res.sendFile(__dirname + '/public/foto.html');
});

app.post('/foto', upload.single('image'), (req, res) => {
    console.log("Envío de fichero");

    if (req.file) console.log(req.file);

    res.json({
        path: req.file.path
    });

        const { dni } = req.body;

        var path = req.file.path;

        var sqlfoto = `INSERT foto (path, dni) values (?,?)`;
    
        const values = [path, dni];

        db.query(sqlfoto, values, (err) => {
            if (!err) {
              console.log ("Insertada la imagen");
            }
            else {
              console.log ("Error al insertar la imagen");
            }
          })  
        console.log("Archivo recibido:", req.file);

        console.log("Datos del formulario:", req.body);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});