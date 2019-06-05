var socket = io('http://localhost:7904/')
var scriptLogs = []
var pendingLogs = []
var activePort = null
var activeProcess = null

socket.on('process_info', function (data) {
  activeProcess = data

  postLog({
    id: 'process_connect',
    type: 'info',
    data: 'Connected to process ' + activeProcess.pid + ' via port ' + socket.io.opts.port
  })
})

socket.on('disconnect', function () {
  postLog({
    id: 'process_disconnect',
    type: 'info',
    data: 'Disconnected from process ' + activeProcess.pid
  })

  activeProcess = null
})

socket.on('log', function (log) {
  if (log.script) {
    scriptLogs.push(log)
  } else {
    postLog(log)
  }
})

function postLog (log) {
  var index = scriptLogs.indexOf(log)
  if (index >= 0) {
    scriptLogs.splice(index, 1)
  }

  pendingLogs.push(log)
  
  if (activePort) {
    activePort.postMessage({
      logs: [log]
    })
  }
}

function flushScriptLogs (scriptId) {
  var logs = scriptLogs.filter(function (log) {
    return log.script === scriptId
  })

  logs.forEach(function (log) {
    postLog(log)
  })
}

chrome.devtools.network.onRequestFinished.addListener(function (request) {
  var headers = request.response.headers
  var relogHeader = headers.find(function (header) {
    return header.name === 'X-Relog'
  })

  if (relogHeader) {
    flushScriptLogs(relogHeader.value)
  }
})

chrome.runtime.onConnect.addListener(function (port) {
  if (port.sender.tab.id !== chrome.devtools.inspectedWindow.tabId) {
    return
  }

  activePort = port
  activePort.onMessage.addListener(function (message) {
    var received = message.receivedLogs
    if (received) {
      pendingLogs = pendingLogs.filter(function (log) {
        return received.indexOf(log.id) < 0
      })
    }
  })

  activePort.onDisconnect.addListener(function (port) {
    if (port === activePort) {
      activePort = null
    }
  })

  if (pendingLogs.length) {
    activePort.postMessage({
      logs: pendingLogs
    })
  }
})

function inject() {
  var tabId = chrome.devtools.inspectedWindow.tabId

  chrome.tabs.executeScript(tabId, {
    code: 'window.RELOG_INJECTED === true',
    runAt: 'document_start'
  }, function (result) {
    if (result && result[0] === false) {
      chrome.tabs.executeScript(tabId, {
        code: 'window.RELOG_INJECTED = true',
        runAt: 'document_start'
      })

      chrome.tabs.executeScript(tabId, {
        file: 'content/relog.js',
        runAt: 'document_start'
      })
    }
  })
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    tabId === chrome.devtools.inspectedWindow.tabId &&
    changeInfo.status === 'loading'
  ) {
    inject()
  }
})

inject()