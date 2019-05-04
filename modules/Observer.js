const _fs = require('fs')
const fs = _fs.promises

module.exports = class {
  constructor (filename) {
    this.filename = filename
    this.char = 0
    this.onLog = function () {}
  }

  init () {
    return fs.writeFile(this.filename, '')
  }

  watch () {
    _fs.watch(this.filename, {
      encoding: 'utf-8'
    }, () => {
      this.read()
    })
  }

  parse (input) {
    var lines = input.split(/\r?\n/)
    var logs = []

    lines.forEach(line => {
      if (line && line.length) {
        if (line[0] === '{' && line[line.length - 1] === '}') {
          try {
            line = JSON.parse(line)
          } catch (e) {}
        }

        logs.push(line)
      }
    })

    return logs
  }

  async read () {
    var data = await fs.readFile(this.filename, {
      encoding: 'utf-8'
    })

    var input = data.substr(this.char)
    var logs = this.parse(input)
    this.char = data.length

    logs.forEach(log => {
      this.onLog(log)
    })
  }
}
