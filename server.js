const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan')

const app = express();
const routes = require('./routes');
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/_info', (req, res) => {
  res.status(200).send({ version: '1.0', name: 'saml-authenticator' });
});

app.get('/healthcheck', (req, res) => {
  res.status(200).send({ status: 'OK' });
});

app.use('/', routes);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

app.listen(port, () => {
  console.log(`HTTP Server Started: Listening to port: ${port}`);
});

