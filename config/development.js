/**
 * Created by rhett on 8/29/16.
 */
'use strict';


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
  }
};

module.exports.database = module.exports.pgsql;
