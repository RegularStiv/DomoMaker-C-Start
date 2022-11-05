const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';
mongoose.connect(dbURI, (err) => {
  if (err) {
    console.log('Could not connect to the database');
    throw err; 
  }
});
const redisURL = process.env.REDISCLOUD_URL || 'redis://default:Be1o3Ct0gM1zhg2EhjXhkcqpespBTa4Q@redis-15353.c99.us-east-1-4.ec2.cloud.redislabs.com:15353';

let redisClient = redis.createClient({
  legacyMode: true,
  url: redisURL
});
redisClient.connect().catch(console.error);

const app = express();

app.use(helmet());
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
}));

app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});
