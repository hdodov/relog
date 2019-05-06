var port = chrome.runtime.connect()

function pad (mask, input) {
  return (mask + input).slice(-mask.length)
}

function logTrace (data) {
  var name = data.name
  var frames = data.frames

  var output = ''
  var args = []
  var padString = (frames.length - 1) + '  '
  var padMask = new Array(padString.length + 1).join(' ')

  frames.forEach(function (frame, i) {
    var id = (frames.length - 1 - i)

    output += '%c' + pad(padMask, id + ': ')
    args.push('font-weight: bold;')

    if (name && i === 0) {
      output += name
    } else {
      if (frame.object) {
        output += '%c' + frame.object
        args.push('color: #881391;')
      }

      if (frame.object && frame.method && frame.operator) {
        output += '%c' + frame.operator
        args.push('color: black;')
      }

      if (frame.method) {
        output += '%c' + frame.method

        if (frame.method.match(/^[a-z0-9_]+$/i)) {
          output += '()'
        }

        args.push('color: #1C00CF;')
      }
    }

    if (frame.file && frame.line) {
      output += '\n%c' + padMask + frame.file + ':' + frame.line
      args.push(id > 0 ? 'margin-bottom: 6px;' : '')
    }

    if (id > 0) {
      output += '\n'
    }
  })

  args.unshift(output)
  console.log.apply(undefined, args)
}

port.onMessage.addListener(function (message) {
  var logs = message.logs
  if (logs) {
    logs.forEach(function (log) {
      if (log.type === 'init') {
        console.log('%c' + log.data, 'font-weight:bold;')
      } else if (log.type === 'log') {
        console.log.apply(undefined, log.data)
      } else if (log.type === 'trace') {
        logTrace(log.data)
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
