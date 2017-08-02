/**
 * Created by rhett on 8/29/16.
 */
'use strict';

// const path   = require('path');
// const extend = require('extend');
//
// const env = process.env;
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
  // Elastic Beanstalk settings
  pgsql: {
    dialect: 'postgres',
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB_NAME,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD
  },
  mongo: {
    database: env.MONGO_DATABASE,
    host:     env.MONGO_HOST,
    port:     env.MONGO_PORT,
    user:     env.MONGO_USER,
    pass:     env.MONGO_PASS
  },
  // Required
  email: {
    region:  awsCreds.region || "us-west-2",
    version: awsCreds.version || "latest",
    from: 'software-procurement-server-noReply@uci.edu',

    ses: extend({rateLimit: 1}, awsCreds.ses)
  },
};

module.exports.database = module.exports.pgsql;
