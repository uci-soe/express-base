/**
 * Created by rhett on 6/5/17.
 */
'use strict';


const env  = process.env.NODE_ENV || 'development';
let config = require(`./${env}`);

const fn = {
  $update: newSettings => config = newSettings,
};

let ConfigProxy = new Proxy({}, {
  get:                      (target, name) => name.match(/^\$/) ? fn[name] : config[name],
  set:                      (target, name, value) => name.match(/^\$/) ? null : config[name] = value,
  getOwnPropertyDescriptor: (target, prop) => Object.getOwnPropertyDescriptor(config, prop),
  ownKeys:                  (target) => Object.getOwnPropertyNames(config),
});

module.exports = ConfigProxy;
