const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOveride = require('method-override');

//
const app = express();

app.use(bodyParser.json());
app.use(methodOveride('_method'));
app.set('view engine', 'ejs');

//mongoDB.
const mongoURL = 'mongodb://mastero:mastero123@ds121331.mlab.com:21331/dbimage';

//connection
const con = mongoose.createConnection(mongoURL);

//init gfs
let gfs;
con.once('open', function() {
  gfs = Grid(con.db, mongoose.mongo);
  gfs.collection('uploads');
});

//create store object
const storage = new GridFsStorage({
  url: mongoURL,
  file: function(req, file) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, function(err, buf) {
        if (err) {
          return reject(err);
        }
        //create file name
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          metadata: { foo: 'bar' }
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
//app route
app.get('/', function(req, res) {
  res.render('index');
});

//route /upload
app.post('/upload', upload.single('file'), function(req, res) {
  //res.json({ file: req.file });
  res.redirect('/');
});

//route /files
app.get('/files', function(req, res) {
  gfs.files.find().toArray((error, files) => {
    //if files existe.
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No files exist' });
    }
    //files existe.
    return res.json(files);
  });
});
const port = 5000;
app.listen(port, function() {
  console.log(`server started on port ${port}`);
});
