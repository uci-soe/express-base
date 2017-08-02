'use strict';

const path   = require('path');
const hbs    = require('hbs');
const url    = require('url');
const config = require('../config');


const __rootdir = path.join(__dirname, '..');


hbs.registerPartials(path.join(__rootdir, 'views', 'partials'));

hbs.registerHelper('extLink', (uri) => url.resolve(config.domain, uri));

require('./hbs-common')(hbs);

module.exports = hbs;
