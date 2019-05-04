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
  var entry = queue.get(filepath)

  if (!entry) {
    entry = queue.add(new Log(filepath))
    queue.flush(filepath).forEach(log => {
      log.read().then(data => {
        console.log(log.id, data)
        return log.unlink()
      })
    })
  } else {
    // Log file was deleted.
    queue.remove(entry.log.id)
  }
})