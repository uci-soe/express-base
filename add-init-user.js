/**
 * Created by rhett on 5/11/17.
 */
'use strict';

const debug = require('debug')('server:init-user');
const db   = require('./models');
const User = db.User;

module.exports = function () {
  debug('Checking database for users');

  return User.findOne({})
    .then(existingUser => {
      if (existingUser) {
        debug('Found user in database. All is good.');
      } else {
        debug('No users in DB, creating initial user');

        const newUser = new User({
          ucinetid: 'rhett',
          campusid: 1181700,
          name:     {
            first: 'Rhett',
            last:  'Lowe'
          },
          email:    'rhett@uci.edu',
          rights:   {
            isAdmin: true,
          }
        });

        newUser.save()
          .then(() => debug(`Initial user saved as ${newUser.ucinetid}`))
          .catch(err => {
            debug('Error making new User.');
            throw err;
          })
        ;

      }
    })
}
