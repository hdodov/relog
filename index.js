#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const Log = require('./modules/Log')
const queue = require('./modules/queue')

const logs = path.join(__dirname, 'logs')

if (process.argv[2] && process.argv[2] === '--loader') {
  console.log(path.join(__dirname, 'loader.php'))
  return
}

fs.watch(logs, (type, filename) => {
  if (type !== 'rename') {
    return
  }

  var filepath = path.join(logs, filename)
  if (queue.isFlushed(filepath)) {
    queue.removeFlushed(filepath)
    return
  }

  if (!queue.get(filepath)) {
    var log = new Log(filepath)
    queue.add(log)

    log.consume().then(() => {
      return queue.flush().forEach(log => {
        console.log(log.data)
      })
    }).catch(err => {
      console.log(err.code)
    })
  }
})