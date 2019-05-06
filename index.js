#!/usr/bin/env node

const path = require('path')
const argv = require('./modules/yargs')
const Observer = require('./modules/Observer')

if (argv.loader) {
  console.log(path.join(__dirname, 'loaders/php/index.php'))
  return
}

var observer = new Observer(argv.file)
observer.init().then(() => {
  console.log(`Watching ${ argv.file }`)
  observer.watch()
})

if (argv.server) {
  require('./modules/server')(observer, {
    port: argv.port
  })
} else {
  observer.on('log', log => {
    if (log.type === 'log' && Array.isArray(log.data)) {
      console.log.apply(undefined, log.data)
    } else {
      console.log(log.data || log)
    }
  })
}
