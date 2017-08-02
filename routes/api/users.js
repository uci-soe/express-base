'use strict';

const router = require('express').Router();
const db     = require('../../models');
const RequestCache = require('../../lib/index-cache').Users;

// const escapeRegex = (str) => new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi');

router.use((req, res, next) => {
  res.locals.meta.baseUrl = req.baseUrl;
  next();
});



router.get('/', (req, res, next) => {
  const user = req.user;
  let query = {};
  let limit = 15;
  let page = 1;

  if (req.query.limit || req.query.limit === 0) {
    limit = +req.query.limit;
  }
  if (req.query.page || req.query.page === 0) {
    page = +req.query.page;
  }

  // if there is a query
  let searchRes = false;
  if (req.query.q && req.query.q.trim()) {
    let weight = null;
    // console.log(req.query)
    if (req.query.weight) {
      weight = req.query.weight;
      console.log(weight)
    }

    searchRes = RequestCache.search(req.query.q, weight);
    query._id = {$in: searchRes.map(d => d.ref)}
  }

  if (!user.rights.isAdmin) {
    query.department = {$in: user.rights.departments};
  }

  let prom = db.User.find(query);

  // sort by query or by date
  if (searchRes) {
    prom = prom.then(docs => searchRes.map(s => docs.find(d => d.id === s.ref)))
  } else {
    prom = prom.sort({'meta.date': -1});
  }

  prom = prom.then(docs => {
    let out = {
      docs: docs,
      total: docs.length,
      limit: limit,
      page: page,
      pages: Math.ceil(docs.length / limit),
      offset: (page - 1) * limit
    };

    if (limit) {
      out.docs = docs.slice(out.offset, out.offset+limit);
    }

    return out;
  });

  prom
    .then(docs => res.send(docs))
    .catch(next)
  ;
});


module.exports = router;
