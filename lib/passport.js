/**
 * Created by rhett on 8/29/16.
 */
'use strict';


const passport      = require('passport');
const LocalStrategy = require('passport-local');
const debug         = require('debug')('server:passport');
const Models        = require('../models');
const WebAuth       = require('./uci-webauth');


passport.serializeUser((user, done) => {
  debug('serializing', user);
  done(null, user.campusid);
});

passport.deserializeUser((id, done) => {
  debug('deserializing', id);
  Models.User.findById(id)
    .catch(err => done(err))
    .then(user => done(null, user));
});

passport.use(new LocalStrategy({
    usernameField: 'ucinetid',
    passwordField: 'password'
  },
  function (ucinetid, password, done) {
    // console.log(Models, Models.User)
    Models.User.findOne({where: {ucinetid: ucinetid}})
      .catch(err => {
        throw err
      })
      .then(function (user) {
        if (!user) {
          return done(null, false, {msg: 'UCINetID not Registered.'});
        }
        if (!user.validPassword(password)) {
          return done(null, false, {msg: 'Incorrect password.'});
        }
        return done(null, user);
      });
  }
));


module.exports = passport;

/**
 * Login Required middleware.
 */
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
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
