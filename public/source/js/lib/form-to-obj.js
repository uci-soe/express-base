/**
 * Created by rhett on 1/5/17.
 */
'use strict';


module.exports = function toObject (formElem) {
  let formArr = $(formElem).serializeArray();
  let formObj = formArr.reduce((obj, n) => {
    obj[n.name] = n.value;
    return obj;
  }, {});
  return formObj;
};
