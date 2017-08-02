/**
 * Created by rhett on 6/16/17.
 */
'use strict';

const ConfirmClass = require('../lib/confirm-modal');
const sendDelete   = require('../lib/send-delete');
const refresh      = require('../lib/refresh');
const url          = require('url');

const confirm = new ConfirmClass('#confirmation-modal');
const USER    = window.USER;



$('.delete-btn').on('click', (e) => {
  e.preventDefault();

  if ($(this).hasClass('disabled')) {
    console.warn('Delete button disabled, likely not an admin. Only administrators may delete users.');
    return;
  }

  confirm.prompt({
    // title: '',
    desc:       'Are you sure you want to delete this request. This will completely remove the request and is unrecoverable.',
    confirmTxt: 'Delete forever',
    // cancelTxt: 'Nevermind'
  })
    .then(confirmed => {
      if (confirmed) {
        return sendDelete(USER.link)
          .then(() => location.href = url.resolve(location.href, './'));
      }
    })
  ;
});

$('.modal.jq-submit .modal-footer .accept-btn').on('click', function (e) {
  e.preventDefault();
  $(this)
    .closest('.modal')
    .find('form')
    .trigger('submit')
  ;
});

$('#user-depts').chosen({width: '95%'});
$('#edit-user-modal').on('show.bs.modal', function (e) {
  $('#user-depts').trigger("chosen:updated")
});



$('.modal.jq-submit form').on('submit', function (e) {
  e.preventDefault();
  const formElem  = $(this);
  const action    = formElem.attr('action');
  const method    = formElem.attr('method');
  const doRefresh = !formElem.closest('.jq-submit').hasClass('no-refresh');

  const form = {
    'name.first':         $('#user-name-first', formElem).val(),
    'name.last':          $('#user-name-last', formElem).val(),
    'email':              $('#user-email', formElem).val(),
    'rights.isAdmin':     $('#user-is-admin', formElem).val() ? '1' : '0',
    'rights.departments': $('#user-depts').val(),
  };

  console.log(action, method, form);

  let activeCall = $.ajax({
        type:        method,
        url:         action,
        contentType: 'application/json',
        data:        JSON.stringify(form),
        dataType:    'JSON',
      })
        .done((res, status, req) => {
          console.log(status);

          if (doRefresh) {
            refresh(true);
          }
        })
        .catch((err, a, b) => console.error(err, a, b))
  ;
});
