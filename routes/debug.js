'use strict';

const express = require('express');
const router  = express.Router();
const config  = require('../config');
const WebAuth = require('../lib/uci-webauth');

router.get('/headers', function (req, res, next) {
  res.json(req.headers);
});
router.get('/cookies', function (req, res, next) {
  res.json(req.cookies);
});
router.get('/session', function (req, res, next) {
  res.json(req.session);
});
router.get('/env', function (req, res, next) {
  res.json(process.env);
});
router.get('/config', function (req, res, next) {
  res.json(config);
});

router.get('/test', function (req, res, next) {
  res.send('okay');
});

module.exports = router;

