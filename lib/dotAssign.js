'use strict';

function dotAssign (object, key, newVal, create = false) {
  if (key.match(/\./)) {
    let keyChain  = key.split(/\./);
    const thisKey = keyChain.shift();

    if (create) {
      if (object[thisKey] === undefined || object[thisKey] === null) {
        object[thisKey] = {};
      }
    } else if (typeof object[thisKey] !== 'object') {
      throw new Error(`object key ${thisKey} is not an object and not assignable`)
    }

    object[thisKey] = dotAssign(object[thisKey], keyChain.join('.'), newVal, create);
  } else {
    object[key] = newVal;
  }

  return object;
}

module.exports = dotAssign;


// let test = {
//   a : {
//     b: {
//       c: 'd'
//     }
//   }
// };
// console.log(dotAssign(test, 'a.b.c', 'e'));
// console.log(dotAssign(test, 'x.y.z', '123', true));
