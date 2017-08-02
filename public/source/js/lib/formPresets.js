/**
 * Created by rhett on 5/19/17.
 */
'use strict';


const parseQuery = require('query-string').parse;

module.exports = () => {
  const query = parseQuery(location.search);
  Object.getOwnPropertyNames(query)
    .forEach(name => {

      // console.log(name, '=', query[name]);

      $(`input[name="${name}"], select[name="${name}"]`)
        .val(query[name])
        .trigger('change')
      ;
    })
  ;
}
