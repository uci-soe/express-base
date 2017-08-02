/**
 * Created by rhett on 8/24/16.
 */
'use strict';


const $       = require('jquery');
window.jQuery = $;
window.$      = $;
// require('chosen-js'); // install and uncomment to use

require('./lib/animate');

require('bootstrap-sass');
const refresh = require('./lib/refresh');

$(function () {
  $('#debug-layout-object-btn').on('click', function (e) {
    e.preventDefault();

    const pre = $('#debug-layout-object');

    pre.slideToggle();
  });
});

$(refresh.onLoad);
