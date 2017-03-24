'use strict';

const express = require('express');
const uciAuth = require('../lib/uci-webauth');
const router  = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express Server'
  });
});

router.get('/logout', function (req, res, next) {
  // req.logout();
  res.redirect(req.webAuth.logoutUrl(req.protocol + '://' + req.get('host') + '/'))
});


/* Login mockup */
router.get('/login', function (req, res, next) {
  if (req.auth && req.auth.isLoggedIn) {
    res.redirect('/');

  } else {
    res.render('uci-login', {
      title:     'Login',
      returnUrl: req.webAuth.returnUrl
    });
  }
});

/* Used with local login. */
// router.post('/login', function (req, res, next) {
//   req.sanitize('ucinetid').trim().toLowerCase();
//   req.assert('ucinetid', 'UCINetID is not valid').matches(/^[a-zA-Z][a-zA-Z\d]*$/);
//   req.assert('password', 'Password cannot be blank').notEmpty();
//
//   let errors = req.validationErrors();
//
//   if (errors) {
//     req.flash('errors', errors);
//     return res.redirect('/login');
//   }
//
//   passport.authenticate('local', (err, user, info) => {
//     if (err) { return next(err); }
//     if (!user) {
//       req.flash('errors', info);
//       return res.redirect('/login');
//     }
//     req.logIn(user, (err) => {
//       if (err) { return next(err); }
//       req.flash('success', { msg: 'Success! You are logged in.' });
//
//       let redirectTo = req.session.returnTo || '/';
//       if (req.session.returnTo) {
//         delete req.session.returnTo;
//       }
//       res.redirect(redirectTo);
//     });
//   })(req, res, next);
//
// });


module.exports = router;



