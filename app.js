// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

if (process.env.NODE_ENV === 'production') {
  require('@google/cloud-trace').start();
  require('@google/cloud-debug');
}

var path = require('path');
var express = require('express');
var config = require('./config');
var logging = require('./lib/logging');

var app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

app.use(logging.requestLogger);


app.use('/reflector/list', require('./reflector/list'))
app.use('/reflector/test', require('./reflector/test'))
app.use('/reflector/upload', require('./reflector/upload'))

app.get('/', function (req, res) {
  res.redirect('/reflector/list');
});

app.use(logging.errorLogger);

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  var server = app.listen(config.get('PORT'), function () {
    var port = server.address().port;
    console.log('Reflector server listening on port %s', port);
  });
}

module.exports = app;