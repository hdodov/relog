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

  consume () {
    if (!this.consumed) {
      return fs.readFile(this.file.path, {
        encoding: 'utf-8',
        flag: 'r'
      }).then(data => {
        this.data = data
        return fs.unlink(this.file.path)
      }).then(() => {
        this.consumed = true
      })
    } else {
      return Promise.resolve()
    }
  }
}