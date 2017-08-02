'use strict';


/**
 * Confirm that two objects are equivalent
 *
 * @param {Object} o1 object to compare
 * @param {Object} o2 object to compare
 * @returns {boolean} are equivalent
 */
const deepEquals = function (o1, o2) {
  const k1 = Object.getOwnPropertyNames(o1).sort();
  const k2 = Object.getOwnPropertyNames(o2).sort();
  if (k1.length !== k2.length) return false;
  return k1.filter(function (key) {
    if (typeof o1[key] === typeof o2[key] === "object") {
      return deepEquals(o1[key], o2[key])
    } else {
      return o1[key] === o2[key];
    }
  }).length === k1.length;
};

/**
 * Check if compiled as JSON
 *
 * @param {String|Mixed} value value to check
 * @returns {boolean} is JSON Compilable
 */
const isJSON = (value) => {
  let isJson = false;
  try {
    JSON.parse(value);
    isJson = true;
  } catch (_) {
  }

  return isJson;
};

/**
 * Compare two values that SHOULD be JSON
 *
 * @param {String|Mixed} o1 object to compare
 * @param {String|Mixed} o2 object to compare
 * @throws {Error} on both object not JSON, function cannot compare
 */
const compareJSON = (o1, o2) => {
  if (isJSON(o1) || isJSON(o2)) {
    let a, b;
    try {
      a = JSON.parse(o1);
    } catch (err) {
      a = err;
    }
    try {
      b = JSON.parse(o2);
    } catch (err) {
      b = err;
    }

    if (isError(a) || isError(b)) {
      return false;
    } else {
      return deepEquals(a, b);
    }
  } else {
    throw new Error('Neither argument JSON');
  }
};

/**
 * Is Error
 * @param err
 */
const isError = err => typeof err === 'object' && err instanceof Error;

/**
 * is Boolean or String: ''
 *
 * @param val
 */
const isBool = val => {
  switch (typeof val) {
    case 'number':
      return !!val;
    case 'string':
      return /^(1|0|true|false)$/i.test(val);
    case 'boolean':
    default:
      return val;
  }
};
const toBool = val => typeof val === 'boolean' ? val : isBool(val) && /^(1|true)$/i.test(val);

module.exports = {
  deepEquals,
  isJSON,
  compareJSON,
  isError,
  isBool,
  toBool,
};
