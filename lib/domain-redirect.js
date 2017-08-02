'use strict';

module.exports = function ({from = null, to} = {}) {
  if (!to) {
    throw new Error('No to given in redirect');
  }

  if (from && typeof from === 'string') {
    from = new RegExp(from, 'i');
  }

  const toRegex = new RegExp(to, 'i');

  return function (req, res, next) {
    const host = req.headers.host;
    if (!host) {
      return next(new Error('No hostname in header'));
    }

    let redirect = false;
    if (from) {
      if (from.test(host)) {
        redirect = true;
      }
    } else if (!toRegex.test(host)) {
      redirect = true;
    }

    if (redirect) {
      return res.redirect(301, req.protocol + '://' + to + req.originalUrl);
    } else {
      next();
    }
  };
};
