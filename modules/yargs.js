const path = require('path')
const logFile = path.join(__dirname, '../data/', 'php.log')

module.exports = require('yargs')
  .scriptName('relog')
  .usage(`
Usage: relog [file]
       relog [options]
       relog <command> [options]`)
  .command({
    command: '* [file]',
    describe: 'Watch new lines added to a file and log them.'
  })
  .command({
    command: 'server',
    describe: 'Starts a WebSocket server that emits the logs.',
    handler: argv => argv.server = true
  })
  .command({
    command: 'loader',
    describe: 'Show the PHP loader filepath.',
    handler: argv => argv.loader = true
  })
  .option('f', {
    alias: 'file',
    type: 'string',
    default: logFile,
    describe: 'Which file to watch.'
  })
  .option('p', {
    alias: 'port',
    default: 7904,
    describe: 'Log server port.'
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .argv
