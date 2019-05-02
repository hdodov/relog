# php-debug

PHP logs in Node.js

## Installation

First, install the package globally:

```
npm i -g php-debug
```

Then, you have to modify _php.ini_ so that the php-debug loader is included. It provides the logging functions you use in your scripts. To get the loader file path, run:

```
php-debug --loader
```

...and then add it to your _php.ini_:

```ini
auto_prepend_file=PATH_TO_PHP_DEBUG\loader.php
```

For the changes to take effect, restart the PHP server.

## Usage

Run the logger with:

```
php-debug
```

In a PHP script, add:

```php
node_log('myvalue'); // or:
node_trace();
```

...and the logs should appear in the Node console.