/**
 * Created by rhett on 5/31/17.
 */
'use strict';

const path         = require('path');
const nodemailer   = require('nodemailer');
const SESTransport = require('nodemailer-ses-transport');
const htmlToText   = require('nodemailer-html-to-text').htmlToText;
const AWS          = require('aws-sdk');
const debug        = require('debug')('server:mailTransport');
const db           = require('../models');

const config = require(`../config`);

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


const ses = new AWS.SES(credentials);
const transport = nodemailer.createTransport(SESTransport({ses: ses, rateLimit: rateLimit}), {from: config.email.from});


// Options available -- https://www.npmjs.com/package/html-to-text#options
transport.use('compile', htmlToText({}));

module.exports = transport;
