var _entries = []

function add (log) {
  var entry = _entries.push({
    flushed: false,
    log
  })

  _entries.sort((a, b) => {
    return (a.log.id < b.log.id) ? -1 : 1
  })

  return entry
}

function remove (id) {
  _entries = _entries.filter(item => item.log.id !== id)
}

function get (filepath) {
  return _entries.find(item => item.log.file.path === filepath)
}

function flush (filepath) {
  var flushed = []

  for (var i = 0; i < _entries.length; i++) {
    let entry = _entries[i]

    if (!entry.flushed) {
      flushed.push(entry.log)
      entry.flushed = true
    }

    if (entry.log.file.path === filepath) {
      break
    }
  }

  return flushed
}

module.exports = {
  add,
  remove,
  get,
  flush
}
