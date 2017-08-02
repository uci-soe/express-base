/**
 * Created by rhett on 6/23/17.
 */
'use strict';

const url    = require('url');
const moment = require('moment');

module.exports = function (hbs) {

  hbs.registerHelper('toJson', (obj) => JSON.stringify(obj));
  hbs.registerHelper('prettyJson', (obj) => JSON.stringify(obj, null, 2));

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
  hbs.registerHelper('ifInArray', function (needle, haystack, options) {
    return (haystack || []).indexOf(needle) > -1 ? options.fn(this) : options.inverse(this);
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

  hbs.registerHelper('newline', () => "\n");
  hbs.registerHelper('join', (arr, glue=',') => arr.join(glue));

  hbs.registerHelper('year', () => moment().year());
  hbs.registerHelper('date', (date) => date ? moment(date).format('L') : '--');
  hbs.registerHelper('dateFormat', (date, format) => date ? moment(date).format(format) : '--');
  hbs.registerHelper('fromNow', (date) => date ? moment(date).fromNow() : '--');
  hbs.registerHelper('duration', (start, end) => start ? moment(start).from(end, true) : '--');

  hbs.registerHelper('ipFilter', (addr) => {
    const match = (addr || '').match(/(\d+\.\d+\.\d+\.\d+)$/);
    return match ? match[1] : '';
  });

  hbs.registerHelper('raw-helper', function(options) {
    return options.fn();
  });

  hbs.registerHelper('input', function(prefix, name, value, options) {
    let type = 'text';
    if (typeof value === 'string') {
      type = 'text';
    } else if (typeof value === 'object') {
      type = 'object';
      value = JSON.stringify(value, null, 2);
    } else if (typeof value === 'boolean') {
      type = 'toggle';
    }

    const encodedValue = encodeURIComponent(value);

    let out = '';
    switch (type) {
      case 'toggle':
        out += `<label class="switch form-control">` +
                  `<input type="checkbox" name="${name}" id="${prefix}${name}" value="1" ${value ? `checked="checked"` : ''} data-value="${encodedValue}" data-changed="0" />` +
                  `<div class="slider round"></div>` +
                `</label>`;
        break;

      case 'object':
        out += `<textarea class="form-control" name="${name}" rows="${value.split(/\n/g).length}" id="${prefix}${name}" data-value="${encodedValue}" data-changed="0">${value}</textarea>`;
        break;

      case 'text':
      default:
        out += `<input type="text" class="form-control" name="${name}" id="${prefix}${name}" value="${value}" data-value="${encodedValue}" data-changed="0" />`;
        break;
    }

    return out;
  });

  hbs.registerHelper('ternary', (bool, ifTrue, ifFalse) => bool ? ifTrue : ifFalse);

};
