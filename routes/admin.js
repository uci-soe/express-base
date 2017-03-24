'use strict';

const router    = require('express').Router();

router.use((req, res, next) => {
  res.locals.meta.baseUrl = req.baseUrl;
  next();
});

router.get('/', function (req, res, next) {
  res.render('admin');
});

module.exports = router;
