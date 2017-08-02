/**
 * Created by rhett on 2/22/17.
 */
'use strict';

function sendDelete (url, data = {}) {
  console.log('Deleting resource ' + url);

  return new Promise((resolve, reject) => {
    let activeCall = $.ajax({
      type:        'DELETE',
      url:         url,
      contentType: 'application/json',
      data:        JSON.stringify(data),
      dataType:    'JSON',
      // statusCode: {
      //   200: () => {},
      //   201: () => {},
      //   202: () => {},
      //   404: () => {},
      //   500: () => {},
      // }
    })
      .done((res, status, req) => {
        if (status === 'success') {
          resolve(true);
        } else {
          let err = new Error('Failed to delete resource: ' + status);
          err.status = res.statusCode;
          reject(err);
        }
      })
      .catch((err) => reject(err))
    ;
  });
}


module.exports = sendDelete;
