#!/usr/bin/env node

const path = require('path')
const Observer = require('./modules/Observer')
const file = path.join(__dirname, 'input.txt')

if (process.argv[2] && process.argv[2] === '--loader') {
  console.log(path.join(__dirname, 'loader.php'))
  return
}

var obs = new Observer(file)
obs.init().then(() => {
  console.log(`Watching ${ file }`)
  obs.watch()
})

obs.onLog = function (log) {
  console.log(log)
}