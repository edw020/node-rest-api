const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+'-'+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true);
    else
        cb(null, false);
};

app.use(bodyParser.json()); // application/json requests
app.use( // Setting up multer for uploading an image
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware for setting headers to allow CORS requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allowing call from any domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Allows these methods on the requests
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Only allows this header types on requests
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Error handlind middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({message: message, data: data});
});


mongoose.connect('mongodb+srv://edward:P4ssw0rd2o19@cluster0-hehis.mongodb.net/messages?retryWrites=true')
    .then(res => {
        app.listen(8080);
    })
    .catch(err => console.log(err));