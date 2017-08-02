/**
 * Created by rhett on 6/19/17.
 */
'use strict';

// const REQUESTS = window.REQUESTS;

const hbs = require('handlebars/dist/handlebars');
const debounce  = require('../lib/debounce');
const Paginator = require('../lib/paginator');

require('../../../../lib/hbs-common')(hbs);

const liTemplate = hbs.compile($('#user-li-template').html());

const state = {
  q: '',
  page:  1,
  limit: 15,
};

const pagination = new Paginator($('.paginator'), {size: 'sm', firstLast: false});
pagination.on('page-select', function (pg) {
  if (pg !== state.page) {
    state.page = pg;
    getResults();
  }
});

$('#searchbox').on('keyup', debounce(function () {
  const q = $('#searchbox').val().trim();
  if (q !== state.q) {
    state.q = q;
    state.page = 1;
    getResults();
  }
}));

function getResults () {
  let data = {
    page:  state.page,
    limit: state.limit,
    weight: {
      fields: {
        admin: 3,
        name: 2,
        ucinetid: 2,
        department: 1,
      },
      bool: 'OR',
      // expand: true
    }
  };

  if (state.q.length >= 2) {
    data.q = encodeURIComponent(state.q);
  }

  $.ajax({
    type:     'GET',
    url:      '/api/users',
    data:     data,
    dataType: 'JSON',
  })
    .then(res => {
      const out = res.docs.map(d => liTemplate(d));
      $('#searchResults').html(out.join('\n'));
      pagination.reset(res.page, res.pages);
    })
  ;
}

$('#user-depts').chosen({width: '95%'});
$('#new-user-modal').on('show.bs.modal', function (e) {
  $('#user-depts').trigger("chosen:updated")
});
$('.modal.jq-submit .modal-footer .accept-btn').on('click', function (e) {
  e.preventDefault();
  $(this)
    .closest('.modal')
    .find('form')
    .trigger('submit')
  ;
});


$('#searchbox').focus();
getResults();
