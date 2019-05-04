const fs = require('fs').promises
const path = require('path')

module.exports = class {
  constructor (filepath) {
    this.file = path.parse(filepath)
    this.file.path = filepath

    this.id = this.file.name
    this.data = undefined
    this.consumed = false
  }

  read () {
    return fs.readFile(this.file.path, {
      encoding: 'utf-8',
      flag: 'r'
    })
  }

  unlink () {
    return fs.unlink(this.file.path)
  }

  consume () {
    if (this.consumed) {
      return
    }

    return this.read().then(data => {
      this.data = data
      return this.unlink()
    }).then(() => {
      this.consumed = true
    })
  }
}