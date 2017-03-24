/**
 * Created by rhett on 8/29/16.
 */
'use strict';


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
};

module.exports.database = module.exports.pgsql;
