#!/usr/bin/env node
/* eslint no-console:0 */
'use strict'

const fs = require('fs')
const path = require('path')

const md = require('../')({
  html: true,
  linkify: false,
  typographer: false
})

// var data = fs.readFileSync(path.join(__dirname, '/samples/lorem1.txt'), 'utf8');
const data = fs.readFileSync(path.join(__dirname, '../test/fixtures/commonmark/spec.txt'), 'utf8')

for (let i = 0; i < 20; i++) {
  md.render(data)
}
