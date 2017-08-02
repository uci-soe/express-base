/**
 * Created by rhett on 6/20/17.
 */
'use strict';

const elasticsearch = require('elasticlunr');
const debug = require('debug')('server:index-cache');
const extend = require('extend');

const __callOnIndex = (fn, checkDoc = false) => {
  return function (...args) {
    if (checkDoc && args[0] && args[0].toObject) {
      args[0] = args[0].toObject;
    }
    if (fn === 'search') {
      args[1] = extend({}, args[1]);
    }
    return this.index[fn].apply(this.index, args);
  }
};

class IndexCache {
  constructor (configFunc, initFunc) {
    this.index = IndexCache.newIndex();
    if (configFunc) {
      this.configFunc = configFunc;
    }
    if (initFunc) {
      this.initFunc = initFunc;
    }

    // function forwarders
    [
      'search',
      'removeDoc',
      'removeDocByRef',
    ].forEach(fn => this[fn] = __callOnIndex(fn));
    [
      'addDoc',
      'updateDoc',
    ].forEach(fn => this[fn] = __callOnIndex(fn, true));
  }
  set configFunc (func) {
    if (typeof func !== 'function') {
      throw new Error('value must be function for setting elasticlunr images');
    }
    this._configFunc = func;
    if (!this.index) {
      this.index = IndexCache.newIndex();
    }
    this._configFunc.call(this.index, this.index);
  }

  set initFunc (func) {
    if (typeof func !== 'function') {
      throw new Error('value must be function for setting elasticlunr images');
    }
    this._initFunc = func;
  }

  get isConfigured () {
    return !!this._configFunc;
  }
  get canInit () {
    return !!this._initFunc;
  }

  static newIndex () {
    return elasticsearch();
  }

  init (func) {
    if (typeof func === 'function') {
      this.initFunc = func;
    }
    if (this.canInit) {
      return this._initFunc();
    } else {
      throw new Error(`No initialization function declared, Cannot initialize cache, `);
    }
  }

  reset () {
    this.index = IndexCache.newIndex(this._configFunc);

    return this.init();
  }
}

let register = {};
let IndexRegister = new Proxy(register, {
  get: function (target, name) {
    if (name === 'entries') {
      return Object.getOwnPropertyNames(target);
    }

    if (target[name]) {
      debug(`Fetching IndexCache at register ${name}`);
      return target[name];
    } else {
      return (config, init) => {
        debug(`Making new IndexCache at register ${name}`);
        return target[name] = new IndexCache(config, init);
      };
    }
  },
  set: function (target, name) {
    throw new Error (name === 'entries' ? 'entries is a private property' : `${name} cannot be set manually`);
  }
});

module.exports = IndexRegister;
