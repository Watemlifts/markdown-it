'use strict'

const commonmark = require('../../extra/lib/node_modules/commonmark')
const parser = new commonmark.Parser()
const renderer = new commonmark.HtmlRenderer()

exports.run = function (data) {
  return renderer.render(parser.parse(data))
}
