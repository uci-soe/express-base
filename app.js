'use strict';

const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const cookieParser  = require('cookie-parser');
const cookieSession = require('cookie-session');
// const session          = require('express-session');
// const RedisStore       = require('connect-redis')(session);
const flash            = require('express-flash');
const expressValidator = require('express-validator');
const bodyParser       = require('body-parser');
const domainRedirect   = require('./lib/domain-redirect');
const uciAuth          = require('./lib/uci-webauth');
const hbs              = require('./lib/hbs-extend');
const extend           = require('extend');
// const jsonAccept       = require('./lib/connect-json-accept');

const routes   = require('./routes/index');
const API      = require('./routes/api');
const admin    = require('./routes/admin');
const user     = require('./routes/user');
const settings = require('./routes/settings');
const debug    = require('./routes/debug');

const app = express();


if (app.get('env') === 'production') {
  app.use(domainRedirect({to: config.host}));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());

// Because you're the type of developer who cares about this sort of thing!
app.set('strict routing', true);

app.use(express.static(path.join(__dirname, 'public', 'build')));

app.use(cookieParser());

app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
  name:   'cng',
  keys:   ['Sakura', 'Ichigo'],
  secret: 'Spinnaker Sloop',
  maxAge: 24 * 60 * 60 * 1000 // ttl 24 hours (in ms)
}));
app.use(uciAuth.connect);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  res.locals = extend({
    meta:      {
      title:       'C&G Database',
      description: 'Maintain information about contracts and grants for UC Irvine, School of Education',
      author:      'Rhett Lowe'
    },
    loginUrl:  '/login',
    logoutUrl: '/logout',
  }, res.locals);
  next();
});

// app.use(jsonAccept(app));


if (app.get('env') === 'development') {
  app.use('/debug', debug);
}

app.use('/', routes);
app.use('/admin', uciAuth.isAuthenticated, uciAuth.isAdmin, admin);
app.use('/user', uciAuth.isAuthenticated, uciAuth.isUser, user);
app.use('/settings', uciAuth.isAuthenticated, uciAuth.isAdmin, settings);
app.use('/api', uciAuth.isAuthenticated, API);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err    = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error:   err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error:   {}
  });
});


module.exports = app;
