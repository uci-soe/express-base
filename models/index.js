'use strict';

const fs       = require('fs');
const path     = require('path');
const debug    = require('debug')('server:mongoose');
const mongoose = require('mongoose');
const basename = path.basename(module.filename);
const config   = require(`../config`);


const mongoConf = config.mongo;

mongoose.Promise = global.Promise;
let userStr = mongoConf.user ? `${mongoConf.user}:${mongoConf.pass}@` : '';
mongoose.connect(`mongodb://${userStr}${mongoConf.host}:${mongoConf.port}/${mongoConf.database}?socketTimeoutMS=90000`);
// mongoose.connect('mongodb://localhost:27017/evals?socketTimeoutMS=90000');

mongoose.connection.on('connected', function () {
  debug('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  debug('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  debug('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    debug('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});



let db = {
  mongoose,
  database: mongoose.connection.db,
  open: new Promise(res => {mongoose.connection.on('open', ref => {res(ref)})})
};

fs
  .readdirSync(__dirname)
  .filter(file => !/^\./.test(file))
  .filter(file => file !== basename && /\.js$/i.test(file))
  .forEach(function (file) {
    const name = file.replace(/\.js$/i, '');
    db[name] = require(path.join(__dirname, name))(mongoose);

  });



module.exports = db;
