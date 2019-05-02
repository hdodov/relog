const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, 'input.txt')

var reading = false
var writing = false
var scheduleClear = false
var amountRead = 0

function clear () {
  if (!writing) {
    writing = true

    fs.writeFile(file, '', err => {
      if (!err) {
        writing = false
        amountRead = 0
      } else {
        clear()
      }
    })
  }
}

function flush () {
  scheduleClear = false

  if (!reading && !writing) {
    reading = true
    scheduleClear = true

    fs.readFile(file, {
      encoding: 'utf-8'
    }, (err, data) => {
      reading = false

      if (data) {
        var log = data.substr(amountRead)
        process.stdout.write(log)
        amountRead += log.length

        if (scheduleClear) {
          clear()
          scheduleClear = false
        } else {
          flush()
        }
      }
    })
  }
}

fs.watch(file, {
  encoding: 'utf-8'
}, flush)
