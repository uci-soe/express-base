/**
 * Created by rhett on 3/30/17.
 */
'use strict';

let Cache = require('../lib/index-cache');

module.exports = function (mongoose) {
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    ucinetid:   {
      type: String,
      lowercase: true,
      trim: true,
      primary: true
    },
    campusid: {
      type: Number,
      min: 1
    },
    name:   {
      first: String,
      last: String
    },
    email:  {
      type:     String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message:   '{VALUE} is not a valid email address.'
      },
    },
    rights: {
      isAdmin: {type: Boolean, default: false},
    }
  }, {
    toObject: {virtuals: true},
    toJSON:   {virtuals: true}
  });

  UserSchema.virtual('name.full').get(function () {
    return `${this.name.first} ${this.name.last}`;
  });
  UserSchema.virtual('name.lastFirst').get(function () {
    return `${this.name.last}, ${this.name.first}`;
  });
  UserSchema.virtual('link').get(function () {
    return `/user/${this._id}`;
  });

  UserSchema.statics.findByNetId = function (ucinetid) {
    return this.findOne({ucinetid});
  };

  UserSchema.methods.accessDept = function (dept, adminOverride = true) {
    return (adminOverride && this.rights.isAdmin) || (this.rights.departments && this.rights.departments.indexOf(dept) !== -1);
  };

  UserSchema.statics.existsConnect = function (idKey, setKey = 'document') {
    if (!idKey) {
      throw new Error('No idKey Given, Please provide key at which ti find the document _id.');
    }

    return (req, res, next) => {
      if (!req.params || !req.params[idKey]) {
        let err    = new Error(`404 Not Found: No ID Provided`);
        err.status = 404;
        return next(err);
      } else {
        this.findById(req.params[idKey])
          .then(data => {
            if (data) {
              req[setKey] = data;
              next();
            } else {
              let err    = new Error(`404 Not Found: Document with ID "${req.params[idKey]}, not found"`);
              err.status = 404;
              return next(err);
            }
          })
          .catch(next)
        ;
      }
    }
  };


  const RequestsCache = Cache.Users(function () {
    this.addField('name');
    this.addField('ucinetid');
    this.addField('campusid');
    this.addField('department');
    this.addField('admin');
    this.addField('email');
    this.setRef('_id');
    this.saveDocument(false);
  });

  const prepDocForCache = (doc) => {
    return {
      _id: doc._id,
      name: doc.name.full,
      ucinetid: doc.ucinetid,
      campusid: doc.campusid,
      department: (doc.rights.departments || []).join(' '),
      admin: doc.rights.isAdmin ? 'admin' : '',
      email: doc.email
    };
  };

  UserSchema.statics.fillIndexCache = function () {
    return new Promise((res, rej) => {
      const stream = this.find({}).cursor();

      stream.on('data', doc => RequestsCache.addDoc(prepDocForCache(doc)));
      stream.on('error', err => rej(err));
      stream.on('close', () => res(RequestsCache));
    });
  };

  UserSchema.post('save', doc => RequestsCache.addDoc(prepDocForCache(doc)));
  UserSchema.post('update', doc => RequestsCache.addDoc(prepDocForCache(doc)));
  UserSchema.post('remove', function (doc) {
    RequestsCache.removeDocByRef(doc._id);
  });

  const Model = mongoose.model('User', UserSchema);

  RequestsCache.init(function () {
    return Model.fillIndexCache();
  });

  return Model;

};
