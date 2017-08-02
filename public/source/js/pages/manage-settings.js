'use strict';

const ConfirmClass                  = require('../lib/confirm-modal');
const confirm                       = new ConfirmClass('#confirmation-modal');
const refresh                       = require('../lib/refresh');
const {compareJSON, isJSON, toBool} = require('../../../../lib/util-funcs');


$('.show-input-change').on('change', 'input, textarea', function () {
  const t            = $(this);
  const decodedValue = decodeURIComponent(t.data('value'));
  let changed        = false;

  if (t.attr('type') === 'checkbox') {
    const origValue = toBool(decodedValue);
    const newValue  = t.is(':checked');

    changed = origValue !== newValue;

  } else {
    const origValue = decodedValue;
    const newValue  = t.val();

    try {
      changed = !compareJSON(origValue, newValue);
    } catch (err) {
      changed = origValue !== newValue;
    }
  }

  if (changed) {
    t.addClass('changed');
    t.data('changed', '1');
  } else {
    t.removeClass('changed');
    t.data('changed', '0');
  }
});


$('form').on('submit', function (e) {
  e.preventDefault();
  const formElem = $(this);
  const action   = formElem.attr('action');
  const method   = formElem.attr('method');

  const changed = $('input.changed, textarea.changed, select.changed', formElem);

  if (changed.length === 0) {
    confirm.prompt({
      title:      'Nothing has Changed',
      desc:       'No values have changed in the form. Submission canceled.',
      cancelTxt:  'Close',
      confirmTxt: null
    });
  } else {
    let send = {};
    changed.each((_, input) => {
      input = $(input);
      if (input.is('input[type=checkbox]')) {
        send[input.attr('name')] = input.is(':checked');
      } else if (isJSON(input.data('value')) || isJSON(input.val())) {
        send[input.attr('name')] = JSON.parse(input.val());
      } else {
        send[input.attr('name')] = input.val();
      }
    });

    console.log(action, method, send);

    $.ajax({
      type:        method,
      url:         action,
      contentType: 'application/json',
      data:        JSON.stringify(send),
      dataType:    'JSON',
    })
      .done((res, status, req) => {
        console.log(status);

        refresh(true);
      })
      .catch((err) => {
        confirm.prompt({
          title:      'Something went wrong',
          desc:       err.message,
          cancelTxt:  'Close',
          confirmTxt: null
        });
      })
    ;
  }
});
