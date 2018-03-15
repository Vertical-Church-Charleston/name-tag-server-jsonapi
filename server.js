const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const port = 8080;
import { getTag, getTags, postTag, postTags, updateTag, deleteTag, printTags } from "./controllers/routes/tag";
const config = require('config');
const cors = require('cors');

global.__basedir = __dirname;

const serverPort = 8080;
//db options
const options = {
  server: {
    socketOptions: {
      keepAlive: 1,
      connectionTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 1,
      connectionTimeoutMS: 30000
    }
  }
};

// db connection
mongoose.connect(config.DBHost, options);
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// don't show the long when in test
if(config.util.getEnv('NODE_ENV') !== 'test'){
  // user morgan to log at the command line
  app.use(morgan('dev'));
}

// Access Control
app.use(cors({
  origin: 'http://localhost:4200',
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept']
}));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:4200");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

app.route('/printtags')
  .get(printTags)
app.route('/tags')
  .get(getTags)
  .post(postTag);
app.route('/tags/:id')
  .get(getTag)
  .delete(deleteTag)
  .patch(updateTag);
app.route('/taglist')
  .post(postTags);

app.listen({
  port: serverPort,
  path: 'api/v1'
})
console.log(`Listening on port ${serverPort}`);

module.exports = app;