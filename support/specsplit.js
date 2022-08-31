#!/usr/bin/env node
/* eslint no-console:0 */

// Fixtures generator from commonmark specs. Split spec to working / not working
// examples, or show total stat.

'use strict'

const fs = require('fs')
const util = require('util')
const argparse = require('argparse')

const cli = new argparse.ArgumentParser({
  prog: 'specsplit',
  version: require('../package.json').version,
  addHelp: true
})

cli.addArgument(['type'], {
  help: 'type of examples to filter',
  nargs: '?',
  choices: ['good', 'bad']
})

cli.addArgument(['spec'], {
  help: 'spec file to read'
})

const options = cli.parseArgs()

/// /////////////////////////////////////////////////////////////////////////////

function normalize (text) {
  return text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>')
}

/// /////////////////////////////////////////////////////////////////////////////

function readFile (filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin

    const chunks = []

    process.stdin.on('data', function (chunk) {
      chunks.push(chunk)
    })

    process.stdin.on('end', function () {
      return callback(null, Buffer.concat(chunks).toString(encoding))
    })
  } else {
    fs.readFile(filename, encoding, callback)
  }
}

/// /////////////////////////////////////////////////////////////////////////////

readFile(options.spec, 'utf8', function (error, input) {
  const good = []; const bad = []
  const markdown = require('..')('commonmark')

  if (error) {
    if (error.code === 'ENOENT') {
      process.stderr.write('File not found: ' + options.spec)
      process.exit(2)
    }

    process.stderr.write(error.stack || error.message || String(error))
    process.exit(1)
  }

  input = input.replace(/→/g, '\t')

  markdown.parse(input, {})
    .filter(function (token) {
      return token.tag === 'code' &&
              token.info.trim() === 'example'
    })
    .forEach(function (token) {
      const arr = token.content.split(/^\.\s*?$/m, 2)
      const md = arr[0]
      const html = arr[1].replace(/^\n/, '')

      const result = {
        md,
        html,
        line: token.map[0],
        err: ''
      }

      try {
        if (markdown.render(md) === normalize(html)) {
          good.push(result)
        } else {
          result.err = markdown.render(md)
          bad.push(result)
        }
      } catch (___) {
        // bad.push(result);
        throw ___
      }
    })

  if (!options.type) {
    console.log(util.format('passed samples - %s, failed samples - %s', good.length, bad.length))
  } else {
    const data = options.type === 'good' ? good : bad

    data.forEach(function (sample) {
      console.log(util.format(
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
        'src line: %s\n\n.\n%s.\n%s.\n',
        sample.line, sample.md, sample.html))
      if (sample.err) {
        console.log(util.format('error:\n\n%s\n', sample.err))
      }
    })
  }

  process.exit(0)
})
