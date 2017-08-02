'use strict';

module.exports = function (fn) {
  let timeout;
  return function () {
    const args = Array.prototype.slice.call(arguments);
    const ctx  = this;

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(ctx, args);
    }, 100);
  }
};
