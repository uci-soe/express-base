'use strict';

const path   = require('path');
const moment = require('moment');

const __rootdir = path.join(__dirname, '..');

module.exports = function (hbs) {

  hbs.registerPartials(path.join(__rootdir, 'views', 'partials'));

  hbs.registerHelper('toJson', (obj) => JSON.stringify(obj));
  hbs.registerHelper('prettyJson', (obj) => JSON.stringify(obj, null, 2));
  // hbs.registerHelper('ifAdmin', function (user, options) {
  //   let isAdmin = user.roles && user.roles.indexOf('admin') !== -1;
  //   return isAdmin ? options.fn(this) : options.inverse(this);
  // });

  // true if sum of other === total
  hbs.registerHelper('ifTotal', function (total, other, options) {
    if (arguments.length < 3) {
      throw new Error('cannot total non-values: ' + JSON.stringify(arguments));
    } else {
      let args = Array.prototype.slice.call(arguments);
      total    = args.shift();
      options  = args.pop();
      other    = args;

      let sum = other.reduce((sum, next) => sum + next, 0);

      return +total === sum ? options.fn(this) : options.inverse(this);
    }
  });
  hbs.registerHelper('ifEq', function (a, b, options) {
    return a == b ? options.fn(this) : options.inverse(this);
  });
  hbs.registerHelper('sum', function (sumArr, options) {
    sumArr  = Array.prototype.slice.call(arguments);
    options = sumArr.pop();
    return sumArr.reduce((sum, next) => sum + next, 0);
  });

  hbs.registerHelper('toFixed', (num, decimals) => Number(num).toFixed(decimals));
  hbs.registerHelper('money', (amount) => new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD'
  }).format(amount));

  hbs.registerHelper('date', (date) => date ? moment(date).format('L') : '--');
  hbs.registerHelper('dateFormat', (date, format) => date ? moment(date).format(format) : '--');
  hbs.registerHelper('fromNow', (date) => date ? moment(date).fromNow() : '--');
  hbs.registerHelper('duration', (start, end) => start ? moment(start).from(end, true) : '--');
};
