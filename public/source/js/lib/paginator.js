'use strict';

const Emitter = require('events').EventEmitter;

const defaultTemplate = `
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li class="skip first">
      <a href="#" data-pg="first" aria-label="First">
        <span aria-hidden="true" class="content"></span>
      </a>
    </li>
    <li class="skip prev">
      <a href="#" data-pg="prev" aria-label="Previous">
        <span aria-hidden="true" class="content"></span>
      </a>
    </li>
    <li class="pg-num"><a href="#" data-pg="1" >1</a></li>
    <li class="pg-num"><a href="#" data-pg="2" >2</a></li>
    <li class="pg-num"><a href="#" data-pg="3" >3</a></li>
    <li class="pg-num"><a href="#" data-pg="4" >4</a></li>
    <li class="pg-num"><a href="#" data-pg="5" >5</a></li>
    <li class="skip next">
      <a href="#" data-pg="next" aria-label="Next">
        <span aria-hidden="true" class="content"></span>
      </a>
    </li>
    <li class="skip last">
      <a href="#" data-pg="last" aria-label="Last">
        <span aria-hidden="true" class="content"></span>
      </a>
    </li>
  </ul>
</nav>
`;



class Paginator extends Emitter {
  constructor (element, {
    size = null,
    firstLast = true,
    prevNext = true,
    first = 'fa-fast-backward',
    firstAria = 'First',
    prev = 'fa-play fa-flip-horizontal',
    prevAria = 'Previous',
    next = 'fa-play',
    nextAria = 'Next',
    last = 'fa-fast-forward',
    lastAria = 'Last',
    span = 2,
  } = {}) {
    super();

    this.element     = element;
    this.elementSize = size;
    this.icons       = {
      first:     firstLast ? first : false,
      firstAria: firstAria,
      prev:      prevNext ? prev : false,
      prevAria:  prevAria,
      next:      prevNext ? next : false,
      nextAria:  nextAria,
      last:      firstLast ? last : false,
      lastAria:  lastAria,
    };
    this.pgSpan      = span;

    this.initTemplate();
    this.reset(0);
    this.setEventListener();
  }

  reset (newPage = null, newPageCount = null, update = true) {
    if (newPageCount !== null) {
      this.setPageCount(newPageCount, false);
    }
    if (newPage !== null) {
      this.setPage(newPage, false);
    }
    if (update) {
      this.update();
    }
  }

  setPage (newPage = null, update = true) {
    this.page = newPage === null ? 1 : newPage;
    if (update) {
      this.update();
    }
  }

  setPageCount (pgCount, update = true) {
    this.pageCount = pgCount;
    if (update) {
      this.update();
    }
  }

  update () {
    const floor = 1;
    const ceil  = this.pageCount > 0 ? this.pageCount : 1;

    // LT floor => floor; GT ceil => ceil; else page
    const pg  = this.page >= floor ? (this.page <= ceil ? this.page : ceil) : floor;
    const min = pg - this.pgSpan >= floor ? pg - this.pgSpan : floor;
    const max = pg + this.pgSpan <= ceil ? pg + this.pgSpan : ceil;

    let pgNums = [];
    // numbers based on span
    for (let i = min; i <= max; i++) {
      pgNums.push(i);
    }

    if (pg === floor) {
      this.toggleIcon('first', false);
      this.toggleIcon('prev', false);
    } else {
      this.toggleIcon('first', true);
      this.toggleIcon('prev', true);
    }

    if (pg === ceil) {
      this.toggleIcon('next', false);
      this.toggleIcon('last', false);
    } else {
      this.toggleIcon('next', true);
      this.toggleIcon('last', true);
    }

    pgNums = pgNums
      .map(i => `<li class="pg-num ${pg === i ? 'active' : ''}"><a data-pg="${i}" href="#">${i}</a></li>`)
      .join('')
    ;

    $('ul.pagination', this.element).each(function (e, elem) {
      $('li.pg-num', $(elem)).not(':first')
        .remove();

      $('li.pg-num', $(elem))
        .replaceWith(pgNums);
    });


  }

  initTemplate () {
    this.element.html(defaultTemplate);
    if (this.elementSize === 'sm' || this.elementSize === 'lg') {
      $('ul.pagination', this.element).addClass(`pagination-${this.elementSize}`);
    }

    ['first', 'prev', 'next', 'last'].forEach(icon => {
      this.setIcon(icon, this.icons[icon]);
    });
  }

  setIcon (iconName, symbol) {
    if (!symbol) {
      $(`li.${iconName}`, this.element).remove();
    } else {
      if (symbol.match(/^fa-/)) {
        symbol = `<i class="fa ${symbol}"></i>`;
      }

      $(`li.${iconName} .content`, this.element).html(symbol);
    }
  }

  toggleIcon (iconName, enabled) {
    if (enabled) {
      $(`li.${iconName}`, this.element)
        .removeClass('disabled')
        .html(
          `<a href="#" data-pg="${iconName}" aria-label="${this.icons[`${iconName}Aria`]}">` +
          $(`li.${iconName}>span, li.${iconName}>a`, this.element).html() +
          `</a>`)
      ;
    } else {
      $(`li.${iconName}`, this.element)
        .addClass('disabled')
        .html(
          `<span>` +
          $(`li.${iconName}>a, li.${iconName}>span`, this.element).html() +
          `</span>`)
      ;
    }
  }

  setEventListener () {
    const self = this;
    $('ul.pagination', this.element).on('click', 'li a', function (e) {
      e.preventDefault();

      let t = $(e.target);
      if (!t.data('pg')) {
        t = t.closest('[data-pg]');
      }

      let pg  = t.data('pg');
      switch (pg) {
        case 'first':
          pg = 1;
          break;
        case 'prev':
          pg = self.page > 1 ? self.page - 1 : 1;
          break;
        case 'next':
          pg = self.page < self.pageCount ? self.page + 1 : self.pageCount;
          break;
        case 'last':
          pg = self.pageCount;
          break;
        default:
          pg = +pg;
          break;
      }

      self.emit('page-select', pg);
    });
  }
}
// Object.setPrototypeOf(Paginator.prototype, Emitter);

module.exports = Paginator;
