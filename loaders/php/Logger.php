<?php
namespace Relog;

class Logger {
  const MAX_DEPTH = 12;
  const MAX_SIZE = 100000;
  const PRINT_PRIVATE = true;

  function __construct ($handle) {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $protocol = $_SERVER['HTTPS'] ?? null;
    $scheme = $protocol === 'on' ? 'https' : 'http';

    $this->handle = $handle;
    $this->id = (string)rand();
    $this->isBrowser = $userAgent !== null;

    $filename = $_SERVER['SCRIPT_FILENAME'] ?? 'unknown';
    $url = $this->isBrowser ? "$scheme://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}" : null;

    $this->write('init', [
      'filename' => $filename,
      'url' => $url
    ]);

    header('X-Relog: ' . $this->id);
  }

  private function write ($type, $input) {
    $log = [
      'type' => $type,
      'time' => microtime(true),
      'script' => $this->id,
      'browser' => $this->isBrowser,
      'data' => $input
    ];

    $encodedLog = json_encode($log,
      JSON_PARTIAL_OUTPUT_ON_ERROR |
      JSON_UNESCAPED_UNICODE |
      JSON_INVALID_UTF8_SUBSTITUTE
    );

    if (!$encodedLog) {
      $log['type'] = 'error';
      $log['data'] = 'Could not encode log.';
      $encodedLog = json_encode($log);
    }

    fwrite($this->handle, $encodedLog . PHP_EOL);
  }

  private static function buffer ($func) {
    ob_start();
    $func();
    return ob_get_clean();
  }

  private static function sanitizeArrayKeys ($array) {
    foreach ($array as $key => $value) {
      $parsedKey = preg_replace('/[[:^print:]]/', '', $key);

      if ($parsedKey !== $key) {
        unset($array[$key]);
        $array[$parsedKey] = $value;
      }
    }

    return $array;
  }

  private static function serialize ($input, $stack = [], &$size = 0) {
    if (in_array($input, $stack, true)) {
      return '<Cyclic>';
    } else if (count($stack) > self::MAX_DEPTH) {
      return '<Deep>';
    }

    if (is_object($input) || is_array($input)) {
      array_push($stack, $input);

      if (is_object($input)) {
        if (get_class($input) !== 'Closure') {
          if (method_exists($input, '__debuginfo')) {
            $input = $input->__debuginfo();
          } else {
            $input = (array)$input;
          }
        } else {
          return '<Closure>';
        }
      }
    }

    if (is_array($input)) {
      $input = self::sanitizeArrayKeys($input);
      $hasPrivate = false;

      foreach ($input as $key => $value) {
        if (self::PRINT_PRIVATE === false && strpos($key, '*') === 0) {
          $hasPrivate = true;
          unset($input[$key]);
          continue;
        }

        if (!is_object($value) && !is_array($value)) {
          $size += strlen((string)$value); // string length, not logical size
        }
      }

      if (count($input) === 0 && $hasPrivate) {
        return '<Private>'; // array contains only private properties
      }

      if ($size <= self::MAX_SIZE) {
        foreach ($input as $key => $value) {
          if (is_object($value) || is_array($value)) {
            $input[$key] = self::serialize($value, $stack, $size);
          }
        }
      } else {
        return '<Large>';
      }
    }

    return $input;
  }

  public function log (...$args) {
    $input = [];

    foreach ($args as $arg) {
      // is_callable() can return true for strings that match the name of a
      // defined global function, so a check for string is needed.
      if (is_callable($arg) && !is_string($arg)) {
        array_push($input, self::buffer($arg));
      } else {
        array_push($input, self::serialize($arg));
      }
    }

    $this->write('log', $input);
  }

  public function dump (...$args) {
    $input = self::buffer(function () use ($args) {
      foreach ($args as $value) {
        var_dump($value);
      }
    });

    $this->write('dump', $input);
  }

  public function trace ($name = null) {
    $trace = [];

    foreach (debug_backtrace() as $frame) {
      $frameData = [
        'file' => $frame['file'] ?? null,
        'line' => $frame['line'] ?? null,
        'object' => $frame['class'] ?? null,
        'operator' => $frame['type'] ?? null,
        'method' => $frame['function'] ?? null
      ];

      if (($frameData['file']) !== __FILE__) {
        array_push($trace, $frameData);
      }
    }

    $this->write('trace', [
      'name' => $name,
      'frames' => $trace
    ]);
  }
}
