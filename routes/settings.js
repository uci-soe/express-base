'use strict';

const router  = require('express').Router();
const uciAuth = require('../lib/uci-webauth');
const debug   = require('debug')('server:settings');
const db      = require('../models');
const config  = require('../config');

router.use(uciAuth.isAdmin);
router.use((req, res, next) => {
  res.locals.meta.baseUrl = req.baseUrl;
  next();
});

router.get('/', (req, res, next) => {
  return db.Settings.getAll(true)
    .then(settings => res.render('settings/manage', {editableSettings: settings}))
    .catch(next)
    ;
});

router.post('/', (req, res, next) => {
  const user    = req.user;
  const changes = req.body;

  db.Settings
    .saveSettings(changes, true)
    .then(() => db.Settings.getAll())
    .then(settings => {
      config.$update(settings);
      return res.send({okay: true});
    })
    .catch(next)
  ;
});

module.exports = router;
