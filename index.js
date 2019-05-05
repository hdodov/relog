#!/usr/bin/env node

const path = require('path')
const Observer = require('./modules/Observer')
const file = path.join(__dirname, 'input.txt')

if (process.argv[2] && process.argv[2] === '--loader') {
  console.log(path.join(__dirname, 'loader.php'))
  return
}

const server = require('http').createServer()
const io = require('socket.io')(server)
io.on('connection', client => {
  console.log('connected', client.id)
});
server.listen(3000, function () {
  console.log('Listening on port 3000')
});

var obs = new Observer(file)
obs.init().then(() => {
  console.log(`Watching ${ file }`)
  obs.watch()
})

var logId = 0
obs.onLog = function (log) {
  log.id = logId++
  // console.log(log)
  io.emit('log', log)
}