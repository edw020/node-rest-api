const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file');

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

    // This is for fixing CORS error on graphql requests
    if(req.method === 'OPTIONS')
        return res.sendStatus(200);

    next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if(!req.isAuth){
        throw new Error('Not authenticated!');
    }

    if(!req.file){
        return res.status(200).json({message: 'No file provided!'});
    }

    if(req.body.oldPath){
        clearImage(req.body.oldPath);
    }

    return res.status(201).json({message: 'File stored', filePath: req.file.path});
});

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err){
        if(!err.originalError){
            return err;
        }

        const data = err.originalError.data;
        const message = err.message || 'An error ocurred';
        const code = err.originalError.code || 500;

        return {
            message,
            status: code,
            data
        }
    }
}));

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