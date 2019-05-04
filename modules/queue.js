var _entries = []
var _flushedFiles = []

function add (log) {
  _entries.push(log)
  _entries.sort((a, b) => {
    return (a.id < b.id) ? -1 : 1
  })
}

function remove (log) {
  var index = _entries.indexOf(log)
  if (index >= 0) {
    _entries.splice(index, 1)
  }
}

function get (filepath) {
  return _entries.find(log => log.file.path === filepath)
}

function flush () {
  var flushed = []

  for (var i = 0; i < _entries.length; i++) {
    let log = _entries[i]

    if (log.consumed) {
      flushed.push(log)
    } else {
      break
    }
  }

  flushed.forEach(log => {
    _flushedFiles.push(log.file.path)
    remove(log)
  })

  return flushed
}

function isFlushed (filepath) {
  return _flushedFiles.indexOf(filepath) >= 0
}

function removeFlushed (filepath) {
  var index = _flushedFiles.indexOf(filepath)
  if (index >= 0) {
    _flushedFiles.splice(index, 1)
  }
}

module.exports = {
  add,
  remove,
  get,
  flush,
  isFlushed,
  removeFlushed
}
