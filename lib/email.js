/**
 * Created by rhett on 6/1/17.
 */
'use strict';

const transport = require('./mailTransport');
const hbs       = require('./hbs-extend');
const path      = require('path');
const debug     = require('debug')('server:email');
const fs        = require('fs-extra');
const extend    = require('extend');
const config    = require('../config');

const pathNormalJoin = (...args) => path.normalize(path.join.apply(path, args));

const sendMailProm = (opts) => {
  return new Promise((res, rej) => {
    debug(`Transmitting message from ${opts.from} to ${opts.to}`);

    transport.sendMail(opts, (err, envelope) => {
      if (err) {
        debug(`Failed in transmitting message from ${opts.from} to ${opts.to}`);
        debug(err.message);
        rej(err);
      } else {
        debug(`Successfully transmitted message from ${opts.from} to ${opts.to}`);

        // fjx messageId to be regional instead of general, email.amazonses.com.
        if (config.email && config.email.region && config.email.ses) {
          envelope.messageId = envelope.messageId.replace(/@email\.amazonses\.com/, `@${config.email.region.toLowerCase()}.amazonses.com`);
        }

        res(envelope);
      }
    });
  });
};

module.exports = {
  _templateDir: pathNormalJoin(__dirname, '..', 'views', 'emails'),
  send:         function (options) {
    const data = extend({config: config}, options, options.data);
    return Promise.resolve(options)
      .then(opts => {
        if (opts.template && !opts.html) {
          debug(`No HTML given, attempting to render Template`);

          return this.render(opts.template, data)
            .then(html => {
              debug(`Saving HTML to options`);
              opts.html = html;

              return opts;
            });
        }
        return opts;
      })
      .then(sendMailProm);
  },
  render:       function (templateLoc, data) {
    templateLoc = pathNormalJoin(this._templateDir, templateLoc);

    return fs.readFile(templateLoc)
      .catch(err => {
        if (err.code === 'ENOENT') {
          debug(`Adding hbs extension to location`);

          templateLoc += '.hbs';
          return fs.readFile(templateLoc);
        } else {
          return Promise.reject(err);
        }
      })
      .then(templateSource => {
        debug(`Fetched Template source, Rendering template`);

        const template = hbs.compile(templateSource.toString());
        return template(data);
      })
      ;
  }
};

