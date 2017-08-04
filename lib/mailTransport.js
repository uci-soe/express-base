/**
 * Created by rhett on 5/31/17.
 */
'use strict';

const path          = require('path');
const nodemailer    = require('nodemailer');
const addressParser = require('nodemailer/lib/addressparser');
const SESTransport  = require('nodemailer-ses-transport');
const htmlToText    = require('nodemailer-html-to-text').htmlToText;
const AWS           = require('aws-sdk');
const punycode     = require('punycode');
const debug         = require('debug')('sps:mailTransport');
const db            = require('../models');

const config = require(`../config`);


/**
 * Clan addressed for unicode and caps
 *
 * borrowed from nodemailers libraries.
 * Modified to lowerCase everything
 *
 * @param {String} address - address to alter
 * @param {Boolean} lowercase - change to Lowercase
 * @returns {string} normalized email address
 * @private
 */
const _normalizeAddress = (address, lowercase = fasle) => {
  address = (address || '').toString().trim();

  if (lowercase) {
    address = address.toLowerCase();
  }

  let lastAt = address.lastIndexOf('@');
  let user   = address.substr(0, lastAt);
  let domain = address.substr(lastAt + 1);

  // Usernames are not touched and are kept as is even if these include unicode
  // Domains are punycoded by default
  // 'jõgeva.ee' will be converted to 'xn--jgeva-dua.ee'
  // non-unicode domains are left as is

  return user + '@' + punycode.toASCII(domain);
}

// get secrets
let awsCreds;
try {
  awsCreds = require(path.join('..', '.aws-credentials.json'));
} catch (err) {
  if (err.code !== 'ENOENT' && err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  } else {
    awsCreds = {};
  }
}


// baseline creds
let credentials = {
  version: awsCreds.version || 'latest',
  region:  awsCreds.region || 'us-west-2'
};
let rateLimit   = 1;

// if statements based on secret credentials
if (awsCreds.ses) {
  if (awsCreds.ses.accessKey) {
    credentials.accessKeyId = awsCreds.ses.accessKey;
  }
  if (awsCreds.ses.secretAccessKey) {
    credentials.secretAccessKey = awsCreds.ses.secretAccessKey;
  }
  if (awsCreds.ses.version) {
    credentials.version = awsCreds.ses.version;
  }
  if (awsCreds.ses.region) {
    credentials.region = awsCreds.ses.region;
  }
  if (awsCreds.ses.rateLimit) {
    rateLimit = awsCreds.ses.rateLimit;
  }
}


const ses       = new AWS.SES(credentials);
const transport = nodemailer.createTransport(SESTransport({ses: ses, rateLimit: rateLimit}), {from: config.email.from});


// Options available -- https://www.npmjs.com/package/html-to-text#options
transport.use('compile', htmlToText({}));

module.exports                        = transport;
module.exports._addressStringToObject = addressParser;
module.exports.addressParser          = (addrs, clean = true) => {
  let out = [];
  if (typeof addrs === 'object' && Array.isArray(addrs)) {
    addrs.forEach(a => out = out.concat(module.exports.addressParser(a, false)));
  } else if (typeof addrs === 'object') {
    out.push(addrs);
  } else {
    out = out.concat(module.exports._addressStringToObject(addrs));
  }

  if (clean) {
    out = module.exports.cleanAddresses(out);
  }

  return out;
};
module.exports.cleanAddresses             = (addrs) => {
  return addrs
    .map(addr => {
      addr.address = _normalizeAddress(addr.address, true);
      return addr;
    })
    .reduce((set, next) => {
      let foundIndex = -1;
      for (let i = 0, l = set.length; i < l; i++) {
        if (set[i].address === next.address) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex > -1 && !set[i].name && next.name) {
        // if there is an identical email, but no name is set AND a name is set in `next`
        set[i].name = next.name;
      } else {
        // if not found in set, add to set
        set.push(next);
      }

      return set;
    }, []);
};
