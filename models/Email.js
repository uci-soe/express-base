/**
 * Created by rhett on 3/30/17.
 */
'use strict';

/*
Not being used,
Idea is to put keys and values to search for settings and allow change of  settings like outgoing email and main admin email.
May implement later.

-- Rhett
 */

const {addressParser, cleanAddresses} = require('../lib/mailTransport');


module.exports = function (mongoose) {
  const Schema = mongoose.Schema;

  const EmailAddressSchema = new Schema({
    string:  String, // Raw string of email.
    name:    String,
    address: {
      type:     String,
      required: true,
      trim:     true,
      validate: {
        validator: function (v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message:   '{VALUE} is not a valid email address.'
      },
    }
  }, {
    toObject: {virtuals: true},
    toJSON:   {virtuals: true}
  });


  const EmailSchema = new Schema({
    messageId:     String,
    thread:        String,
    originMessage: {
      type:    Boolean,
      default: function () {
        return this.thread === this.messageId;
      }
    },
    relatedIds:    [String],
    addresses:     {
      type:     [EmailAddressSchema],
      validate: [val => val.length > 0, '{PATH} exceeds the limit of 10']
    },
    transmitted:   {type: Date, default: Date.now},
    envelope:      Schema.Types.Mixed,
    message:       Schema.Types.Mixed,
  }, {
    toObject: {virtuals: true},
    toJSON:   {virtuals: true}
  });


  EmailSchema.statics.createFromMail = function (data) {

    // get all addresses relevant to this email.
    let addresses = [];
    ['to', 'from', 'reply-to', 'replyTo', 'cc', 'bcc'].forEach(key => {
      if (key in data) {
        addresses = addresses.concat(addressParser(data[key], false));
      }
    });
    addresses = cleanAddresses(addresses);

    let email = new this({
      // messageId: '',
      // thread:        '',
      // originMessage: '', // default check will fail, re-check on envelope update
      // relatedIds:    '',
      addresses:     addresses,
      // transmitted:   '', // allow to default to NOW()
      // envelope:      '', // add later in envelope update
      message:       data,
    });

    if (data.references && data.referenceCount.length) {
      email.relatedIds = data.references;
      email.thread = data.references[data.referenceCount.length - 1];
    }

    return email.save();
  };

  /**
   * Add envelope information to Database object.
   *
   * Intended to be used after createFromEmail has created the initial object.
   *
   * @param {String|ObjectId} savedId - ID of Object to update with envelope information
   * @param {Object} envelope - Envelope information to update
   * @return {Promise} returns the envelope unchanged.
   */
  EmailSchema.statics.updateEnvelope = function (savedId, envelope) {
    return this.findById(savedId)
      .then(mail => {
        if (!mail) {
          return Promise.reject(new Error ('ID Reference does not match existing records.'));
        }

        if (!mail.thread) {
          mail.thread = envelope.messageId;
        }

        if (!mail.relatedIds.includes(envelope.messageId)) {
          mail.relatedIds.push(envelope.messageId);
        }

        mail.envelope = envelope;
        mail.messageId = envelope.messageId;
        mail.originMessage = envelope.messageId === mail.thread;

        return mail.save()
          .then(() => envelope);
      })
  };

  EmailSchema.statics.findByEnvelope = function ({messageId}) {
    return this.findOne({messageId})
  };


  return mongoose.model('Email', EmailSchema);

};
