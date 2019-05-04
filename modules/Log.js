const fs = require('fs').promises
const path = require('path')

module.exports = class {
  constructor (filepath) {
    this.file = path.parse(filepath)
    this.file.path = filepath
    this.id = this.file.name
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
}