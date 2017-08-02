/**
 * Created by rhett on 3/30/17.
 */
'use strict';

const extend = require('extend');

module.exports = function (mongoose) {
  const Schema = mongoose.Schema;

  const SettingsSchema = new Schema({
    key:   {type: String, unique: true, primary: true},
    value: Schema.Types.Mixed
  });

  SettingsSchema.statics.getAll = function (restrict = false) {
    let query = restrict ? {key: {$nin: this.DO_NOT_DISPLAY}} : {};

    return this.find(query)
      .then(raw => {
        // console.log(raw);
        return raw
          .map(s => s.toObject())
          .reduce((obj, {key, value}) => {
            // console.log({key, value});
            obj[key] = value;
            return obj;
          }, {});
      })
      .catch(err => console.error(err.stack))
  };
  SettingsSchema.statics.get    = function (key) {
    return this.findOne({key});
  };
  SettingsSchema.statics.set    = function (key, value) {
    return key.match(/^\$/) ? Promise.resolve(null) : this.findOneAndUpdate({key}, {key, value}, {upsert: true});
  };

  SettingsSchema.statics.saveSettings = function (settings, restrict = false) {
    if (!Array.isArray(settings)) {
      settings = Object
        .getOwnPropertyNames(settings)
        .filter(i => !i.match(/^\$/))
        .map(key => {
          return ({key, value: settings[key]});
        });
    }

    if (restrict) {
      settings = settings.filter(({key}) => this.DO_NOT_DISPLAY.indexOf(key) === -1);
    }

    return Promise.all(settings.map(({key, value}) => this.set(key, value)));
  };
  SettingsSchema.statics.initialize   = function (initSettings) {
    return this.getAll()
      .then(settings => this.saveSettings(extend({}, initSettings, settings)))
      .then(() => this.getAll())
    ;
  };
  SettingsSchema.statics.DO_NOT_DISPLAY = [
    'mysql',
    'pgsql',
    'redis',
    'mongo',
    'database',
  ];


  return mongoose.model('Settings', SettingsSchema);

};
