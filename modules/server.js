module.exports = function (observer, { port }) {
  var server = require('http').createServer()
  var io = require('socket.io')(server)
  server.listen(port, function () {
    console.log(`Listening on port ${ port }`)
  })

  io.on('connect', socket => {
    socket.emit('process_info', {
      pid: process.pid,
      cwd: process.cwd()
    })
  })

  var logId = 0
  observer.on('log', log => {
    if (typeof log !== 'object') {
      log = {
        data: log
      }
    }

    log.id = logId++
    io.emit('log', log)
  })
}
