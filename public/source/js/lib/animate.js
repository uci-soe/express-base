/**
 * Created by rhett on 5/18/17.
 *
 * For use, install `animatewithsass` using `yarn add animatewithsass` and uncomment in main.js
 */
'use strict';

const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
$.fn.extend({
  animateCss: function (animationName) {

    return new Promise((res, rej) => {
      this.addClass('animated ' + animationName).one(animationEnd, function () {
        $(this)
          .removeClass('animated ' + animationName)
          .promise()
          .done(res)
        ;
      });
    });

  }
});
