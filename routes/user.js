'use strict';

const router    = require('express').Router();
const uciAuth   = require('../lib/uci-webauth');
const debug     = require('debug')('server:user');
const util      = require('util');
// const email   = require('../lib/email');
const db        = require('../models');
const dotAssign = require('../lib/dotAssign');

router.use((req, res, next) => {
  res.locals.meta.baseUrl = req.baseUrl;
  next();
});


router.get('/', uciAuth.isAdmin, (req, res, next) => {
  return res.render('user/list', {});
});

router.post('/', uciAuth.isAdmin, (req, res, next) => {
  const user = req.user;
  // db.Document.get('software-procurement', 'rev.3')

  if (req.body.ucinetid && (!req.body.email || req.body.email.trim() === '')) {
    req.body.email = req.body.ucinetid.trim().toLowerCase() + '@uci.edu';
  }

  req.checkBody('name.first', 'First Name Required').notEmpty().isAlpha();
  req.checkBody('name.last', 'Last Name Required').notEmpty().isAlpha();
  req.checkBody('ucinetid', 'UCINetID Required').notEmpty().isAlpha();
  req.checkBody('campusid', 'Campus ID must be number').optional().isNumeric();
  req.checkBody('email', 'Invalid email address').notEmpty().isEmail();
  req.checkBody('rights.isAdmin', 'Invalid isAdmin Value, must be boolean|truthy|falsey').optional().isBoolNull();
  req.checkBody('user-notify', 'Invalid notification setting, must be boolean|truthy|falsey').optional().isBoolNull();

  req.sanitizeBody('email').normalizeEmail();
  req.sanitizeBody('rights.isAdmin').toBoolean(true);
  req.sanitizeBody('user-notify').toBoolean(true);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        debug('validation failure on user creation form');

        let err    = new Error('There have been validation errors: ' + util.inspect(result.array()));
        err.status = 400;
        return Promise.reject(err);
      }
    })

    // Check for existing User
    .then(() => {
      let query = {ucinetid: req.body.ucinetid};
      if (req.body.campusid) {
        query = {$or: [query, {campusid: req.body.campusid}]};
      }
      return db.User.findOne(query);
    })
    .then(existingUser => {
      if (existingUser) {
        let err    = new Error(`User exists with UCINetID or Campus ID, please contact support for more information.`);
        err.status = 400;
        return Promise.reject(err);
      }
    })

    // Check for existing departments
    .then(() => db.Department.find({}, {abbrev: 1}))
    .then(depts => {
      depts = depts.map(d => d.abbrev);
      req.body['rights.departments'].forEach(d => {
        if (depts.indexOf(d) === -1) {
          let err    = new Error(`Department ${d} doesn't exist in system, Please contact support for help.`);
          err.status = 400;
          return Promise.reject(err);
        }
      });
    })

    // make user
    .then(() => {
      const newUser = new db.User({
        name: {first: req.body['name.first'], last: req.body['name.last']},
        ucinetid: req.body['ucinetid'],
        email: req.body['email'],
        rights: {
          isAdmin: user.rights.isAdmin && req.body['rights.isAdmin'],
          departments: req.body['rights.departments']
        }
      });

      if (req.body['campusid']) {
        newUser.campusid = req.body['campusid'];
      }

      return newUser.save();
    })

    // Enqueue user creation email
    .then(user => {
      if (req.body['user-notify']) {
        // do email stuffs here
      }

      return user;
    })

    // redirect to user
    .then(user => {
      res.redirect(user.link);
    })

    .catch(err => next(err))
  ;
});

router.get('/:id', db.User.existsConnect('id', 'reqUser'), function (req, res, next) {
  const reqUser = req.reqUser;
  const user    = req.user;

  // only admin and self may view
  if (user.rights.isAdmin || user._id === reqUser._id) {
    return db.Department.find({})
      .then(departments => res.render(`user/manage`, {reqUser, departments}))
      .catch(next)
      ;
  } else {
    let err    = new Error('Not authorized to view this document.');
    err.status = 401;
    return next(err);
  }
});

const userEditable = ['name.first', 'name.last', 'email', 'rights.isAdmin'];
router.put('/:id', db.User.existsConnect('id', 'reqUser'), function (req, res, next) {
  let reqUser = req.reqUser;
  const user  = req.user;
  const form  = req.body;

  // Only admin and self may edit
  if (user.rights.isAdmin || user._id === reqUser._id) {
    let editable = Object.getOwnPropertyNames(form)
      .filter(key => userEditable.indexOf(key) !== -1)
    ;

    // Only administrators may change administrator flags,
    if (!user.rights.isAdmin) {
      editable = editable.filter(key => key !== 'rights.isAdmin');
    } else if (user._id === reqUser._id && editable.indexOf('rights.isAdmin') > -1) {
      // Admins may not remove their own admin flags
      if (form['rights.isAdmin'] == false) { // if falsey
        // remove from edit list
        editable = editable.filter(key => key !== 'rights.isAdmin');
      }
    }

    if (!editable.length) {
      let err    = new Error('None of the given fields can can be edited in this document');
      err.status = 400;
      return next(err);
    }

    editable.forEach(key => {
      reqUser = dotAssign(reqUser, key, form[key]);
    });
    reqUser.save()
      .then(() => db.User.findById(reqUser._id))
      .then(newUser => res.send(newUser))
      .catch(next)
    ;
  } else {
    let err    = new Error('Not authorized to view this document.');
    err.status = 401;
    return next(err);
  }
});
router.delete('/:id', uciAuth.isAdmin, db.User.existsConnect('id', 'reqUser'), function (req, res, next) {
  const reqUser = req.reqUser;
  const user    = req.user;

  // User may not delete themselves
  if (user._id !== reqUser._id) {
    reqUser.remove()
      .then(() => res.send({removed: true, reqUser}))
      .catch(next)
    ;
  } else {
    let err    = new Error('Not authorized to remove this document. User may not delete self.');
    err.status = 401;
    return next(err);
  }
});


module.exports = router;
