#!/usr/bin/env node

const _fs = require('fs')
const fs = _fs.promises
const path = require('path')
const file = path.join(__dirname, 'input.txt')

if (process.argv[2] && process.argv[2] === '--loader') {
  console.log(path.join(__dirname, 'loader.php'))
  return
}

var amountRead = 0

function parse (input) {
  var lines = input.split(/\r?\n/)
  var logs = []

  lines.forEach(line => {
    if (line && line.length) {
      if (line[0] === '{' && line[line.length - 1] === '}') {
        try {
          line = JSON.parse(line)
        } catch (e) {}
      }

      logs.push(line)
    }
  })

  return logs
}

async function flush () {
  var data = await fs.readFile(file, {
    encoding: 'utf-8'
  })

  var input = data.substr(amountRead)
  var logs = parse(input)
  amountRead += input.length

  logs.forEach(log => {
    console.log(log)
  })
}

async function watch () {
  await fs.writeFile(file, '')
  console.log('Watching...')

  _fs.watch(file, {
    encoding: 'utf-8'
  }, flush)
}

watch()
