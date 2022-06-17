/**
 * Server Common Module - Chat & Push
 */
const fs = require('fs');
const dateFormat = require('dateformat');
// const config = require('../config');
// const auth = require('../authKey');
// const helpers = require('../helpers');
//const moment = require('moment');
// -------------------------
// Logging api
// -------------------------
//const logger = require('../logger');
//const winstonLogger = logger.setup('daemon');

// ------------------------------
// Server Common
// ------------------------------
const express = require('express');
const app = express();

// SSL
// const credentials = {
//   key: fs.readFileSync(config.ssl.key),
//   cert: fs.readFileSync(config.ssl.cert),
//   ca: ((!helpers.isEmpty(config.ssl.ca)) ? fs.readFileSync(config.ssl.ca) : ''),
// };
//const server = require('https').createServer(credentials, app);
const server = require('http').createServer(app);

const io = require('socket.io')(server);



module.exports = {
  // Server
  io: io,
  server: server,

  //  Messaging
  pub: pub,     // pub client (publish)
  sub: sub,     // sub client (subscribe)

  auth: auth,
  logger: logger,

  // expire Time
  //flooredDate: flooredDate,
}
