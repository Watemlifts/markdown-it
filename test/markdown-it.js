'use strict'

const path = require('path')

const generate = require('markdown-it-testgen')

describe('markdown-it', function () {
  const md = require('../')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  })

  generate(path.join(__dirname, 'fixtures/markdown-it'), md)
})
