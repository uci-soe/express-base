/**
 * Created by rhett on 8/29/16.
 */
'use strict';

// const path   = require('path');
// const extend = require('extend');
//
// // get secrets
// let awsCreds;
// try {
//   awsCreds = require(path.join('..', '.aws-credentials.json'));
// } catch (err) {
//   if (err.code !== 'ENOENT' && err.code !== 'MODULE_NOT_FOUND') {
//     throw err;
//   } else {
//     awsCreds = {};
//   }
// }

module.exports = {
  mysql: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'db',
    username: 'user',
    password: 'pass'
  },
  pgsql: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'db',
    username: 'user',
    password: 'pass'
  },
  redis: {
    host: 'localhost:6379',
    database: 'sessions'
  },
  mongo: {
    database: "software-server",
    host:     "localhost",
    port:     27017,
    user:     null,
    pass:     null
  },


  // Required
  email: {
    region:  awsCreds.region || "us-west-2",
    version: awsCreds.version || "latest",
    from: 'seftware-procurement-server-noReply@uci.edu',

    ses: extend({rateLimit: 1}, awsCreds.ses)
  },

  // required in email templates
  domain: 'http://sps.uci.edu:3000',
};

module.exports.database = module.exports.mongp;
