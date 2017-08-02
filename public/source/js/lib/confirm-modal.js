'use strict';


/**
 *
 * @param {jQueryElement} elem jQuery elemeny of the confirm html
 * @constructor
 */
class Confirm {
  constructor (elem) {
    this._elem = $(elem);
  }

  get element () {
    return this._elem;
  }

  setText ({title = 'Please Confirm', desc = null, confirmTxt = 'Confirm', cancelTxt = 'Cancel'} = {}) {
    const elem = this.element;
    $('#confirmation-label', elem).html(title);

    if (desc) {
      $('.modal-body', elem).show();
      $('#confirmation-text', elem).html(desc);
    } else {
      $('.modal-body', elem).hide();
      $('#confirmation-text', elem).html('');
    }

    if (!confirmTxt) {
      $('#confirmation-confirm', elem).hide();
    } else {
      $('#confirmation-confirm', elem).html(confirmTxt).show();
    }
    if (!cancelTxt) {
      $('#confirmation-cancel', elem).hide();
    } else {
      $('#confirmation-cancel', elem).html(cancelTxt).show();
    }
  }


  /**
   * Open new prompt
   *
   * @param {String} title -- Title Section Text
   * @param {String|Null} desc -- Description area text. Null hides description
   * @param {String|Null} confirmTxt -- text of the confirm button. Null hides button
   * @param {String|Null} cancelTxt -- text of the cancel button. Null hides button
   *
   * @return {Promise} Resolve on confirm, Reject on Cancel
   */
  prompt ({title = 'Please Confirm', desc = null, confirmTxt = 'Confirm', cancelTxt = 'Cancel'} = {}) {
    const self = this;
    const elem = self.element;
    this.setText({title, desc, confirmTxt, cancelTxt});

    return new Promise((resolve, reject) => {

      $('#confirmation-confirm', elem).on('click', function (e) {
        e.preventDefault();
        self.reset();
        resolve(true);
      });

      $('#confirmation-cancel', elem).on('click', function (e) {
        e.preventDefault();
        self.reset();
        resolve(false);
      });
      elem.on('hide.bs.modal', function (e) {
        e.preventDefault();
        self.reset();
        resolve(false);
      });

      this.open();
    });
  }

  reset () {
    const elem = this.element;

    elem.off('hide.bs.modal');
    this.close();
    $('#confirmation-confirm', elem).off('click');
    $('#confirmation-cancel', elem).off('click');
    this.setText();
  }

  open () {
    this.element.modal('show');
  }
  close () {
    this.element.modal('hide');
  }
}



module.exports = Confirm;
