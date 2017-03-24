/**
 * Created by rhett on 2/28/17.
 */
'use strict';

const extend = require('extend');
const fetch  = require('node-fetch');
const debug  = require('debug')('server:UCIWebAuth');
// const db     = require('../models');

const default_options = {
  // The URLs to the web authentication at login.uci.edu
  loginUrl:  'https://login.uci.edu/ucinetid/webauth',
  logoutUrl: 'https://login.uci.edu/ucinetid/webauth_logout',
  checkUrl:  'http://login.uci.edu/ucinetid/webauth_check',
};

class WebAuth {
  /**
   * @param {Request} req - an express Request object
   */
  constructor (req) {
    this._loginUrl  = default_options.loginUrl; // + '?return_url=' + encodeURIComponent(url);
    this._logoutUrl = default_options.logoutUrl; // + '?return_url=' + encodeURIComponent(url);
    this._checkUrl  = default_options.checkUrl; // + '?ucinetid_auth=' + this.cookie;

    this.isLoggedIn = false;
    this.resp       = null;

    this.remoteAddr = req.ip;
    this.cookie     = req.cookies && req.cookies['ucinetid_auth'] || null;

    this.returnPath = req.originalUrl;
    if (req.session && req.session.returnPath) {
      this.returnPath = req.session.returnPath;
      delete req.session.returnPath;
    }
    this.returnUrl = req.protocol + '://' + req.get('host') + this.returnPath;
  }

  check () {
    // First, we'll check that we even have a cookie
    if (!this.cookie || this.cookie === 'no_key') {
      debug('No key given; not checking token.');
      return Promise.reject(new Error('No Cookie Available'));
    }

    debug('Checking Token: ' + this.cookie);
    return fetch(this.checkUrl(this.cookie))
      .then(r => r.text())
      .then(body => WebAuth.parseAuthResp(body))
      .then(r => {
        this.resp = r;

        debug(`Checking authorized host continuity -- AuthHost: ${r.auth_host}; RemoteHost: ${this.remoteAddr}`);
        if (new RegExp('(' + r.auth_host + '|127.0.0.1)$').test(this.remoteAddr)) {
          this.isLoggedIn = !!(this.resp && this.resp.time_created);
          debug('Host Authorised. User is ' + (this.isLoggedIn ? 'logged in' : 'not logged in, based on creation time response'));
          this.reason = 'Authorization Session Timeout';
          return this;
        } else {
          debug('Host Not Authorised.');
          throw new Error('Warning, the auth host doesn\'t match.');
        }
      })
      ;
  }

  /**
   *
   * @param {String} body - Body Response from server
   * @return {Object} - parsed object from server
   */
  static parseAuthResp (body) {
    let out = {};
    // Parse
    body
      .split(/\n/g)                                 // separate by line
      .filter(r => !!r)                             // remove blank lines
      .forEach(row => {
        const [key, val] = row.trim().split(/=/);   // separate key and val by "="
        out[key]         = val;                             // assign out
      })
    ;

    // Correct exceptions
    out.campusid         = +out.campus_id;                  // campusid should be a number without leading zeros
    out.uci_affiliations = (out.uci_affiliations || '').split(/,/g);

    return out;
  }

  loginUrl (returnUrl = null) {
    return this._loginUrl + (returnUrl ? '?return_url=' + encodeURIComponent(returnUrl) : '');
  }

  logoutUrl (returnUrl = null) {
    return this._logoutUrl + (returnUrl ? '?return_url=' + encodeURIComponent(returnUrl) : '');
  }

  checkUrl (cookie) {
    return this._checkUrl + (cookie ? '?ucinetid_auth=' + cookie : '');
  }
}


module.exports         = WebAuth;
module.exports.options = default_options;


module.exports.connect = function (req, res, next) {
  let auth = new WebAuth(req);
  if (auth.cookie) {
    auth.check()
      .then(_ => {
        if (!auth.isLoggedIn) {
          throw new Error(auth.reason || 'Unknown login issue');
        }
        return db.User.findByNetId(auth.resp.ucinetid)
          .then(usr => {
            if (usr) {
              req.user = usr;
            } else {
              let err = new Error('UCI User Logged in, but not authorized for this site. Contact Administrators to gain access.');
              err.status = 401;
              throw err;
            }
          });
      })
      .catch(err => {
        res.locals.auth_msg = res.locals.auth_msg || [];
        if (err.message !== 'No Cookie Available' && err.message !== 'Authorization Session Timeout') {
          res.locals.auth_msg.push(err.message);
        }
        return false;
      })
      .then(() => {
        // res.locals.user = req.user;
        res.locals.auth = auth;
        req.webAuth     = auth;
        next();
      })
    ;
  } else {
    // res.locals.user = {};
    res.locals.auth = auth;
    req.webAuth     = auth;
    next();
  }
};

/**
 * Login Required middleware.
 */
module.exports.isAuthenticated = (req, res, next) => {
  if (req.webAuth && req.webAuth.isLoggedIn) {
    return next();
  }
  req.session.returnPath = req.originalUrl;
  res.redirect('/login');
};
module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  let err    = new Error('Permission Denied.');
  err.status = 403;
  next(err);
};
