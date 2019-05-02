# php-debug

PHP logs in Node.js

## Installation

First, install the package globally:

```
npm i -g php-debug
```

To check where the package was installed, run:

```
npm ls php-debug -g
```

Then, modify your _php.ini_ to include the php-debug loader:

```ini
auto_prepend_file=PATH_TO_GLOBAL_NODE_MODULES\php-debug\loader.php
```

For the changes to take effect, restart the PHP server.

## Usage

Run the logger with:

```
php-debug
```

In a PHP script, run:

```php
node_log('myvalue'); // or:
node_trace();
```

...and the logs should appear in the Node console.