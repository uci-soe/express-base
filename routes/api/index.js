/**
 * Created by rhett on 1/20/17.
 */
'use strict';

const router  = require('express').Router();

router.use('/users', require('./users'));

module.exports = router;
