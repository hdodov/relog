var socket = io('http://localhost:3000/')
var activePort = null
var pendingLogs = []

socket.on('log', function (log) {
  pendingLogs.push(log)
  
  if (activePort) {
    activePort.postMessage({
      logs: [log]
    })
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