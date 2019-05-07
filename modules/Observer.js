const fs = require('fs')
const EventEmitter = require('events')

module.exports = class extends EventEmitter {
  constructor (filename) {
    super()

    this.filename = filename
    this.char = 0

    this.pollTimer = null
    this.pollRate = 150
    this.poll()
  }

  init () {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filename, '', err => {
        err ? reject(err) : resolve()
      })
    })
  }

  watch () {
    fs.watch(this.filename, {
      encoding: 'utf-8'
    }, () => {
      // Clear timeout before read() to prevent the timer from completing
      // while reading and causing another read.
      clearTimeout(this.pollTimer)
      this.read()
    })
  }

  poll () {
    clearTimeout(this.pollTimer)
    this.pollTimer = setTimeout(() => {
      this.read()
    }, this.pollRate)
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

  read () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filename, {
        encoding: 'utf-8'
      }, (err, data) => {
        if (!err) {
          var input = data.substr(this.char)
          var logs = this.parse(input)
          this.char = data.length

          logs.forEach(log => {
            this.emit('log', log)
          })
        } else {
          console.warn(err)
        }

        this.poll()
        resolve()
      })
    })
  }
}
