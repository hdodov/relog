var port = chrome.runtime.connect()

port.onMessage.addListener(function (message) {
  var logs = message.logs
  if (logs) {
    logs.forEach(function (log) {
      if (log.type === 'log') {
        console.log.apply(undefined, log.data)
      } else {
        console.log(log.data || log)
      }
    })

    port.postMessage({
      receivedLogs: logs.map(function (log) {
        return log.id
      })
    })
  }
})

window.addEventListener('beforeunload', function () {
  port.disconnect()
})
