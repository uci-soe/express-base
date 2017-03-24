/**
 * Created by rhett on 1/6/17.
 */
'use strict';

module.exports = function refresh (scroll) {
  const loc = window.location;
  if (scroll === true) {
    scroll = $(window).scrollTop();
  }
  if (scroll === +scroll) {
    if (+scroll) {
      loc.hash = 's=' + scroll;
    }
  } else {
    loc.hash = scroll;
  }
  loc.reload(true);
};

module.exports.onLoad = function scrollCheck () {
  const loc = window.location;
  if (loc.hash) {
    let match = loc.hash.match(/s=(\d+)/i);
    if (match && +match[1]) {
      $(window).scrollTop(+match[1])
    }
  }
};
