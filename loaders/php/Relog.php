<?php
namespace Relog;

class Logger {
  function __construct ($handle) {
    $this->handle = $handle;
    $this->id = (string)rand();

    $this->write('init', $_SERVER['SCRIPT_FILENAME']);
    header('X-Relog: ' . $this->id);
  }

  private function write ($type, $input) {
    $log = [
      'type' => $type,
      'time' => microtime(true),
      'script' => $this->id,
      'data' => $input
    ];

    $encodedLog = json_encode($log, JSON_PARTIAL_OUTPUT_ON_ERROR);

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
      $parsedKey = preg_replace('/[^A-Za-z0-9_-]/', '', $key);

      if ($parsedKey !== $key) {
        unset($array[$key]);
        $array[$parsedKey] = $value;
      }
    }

    return $array;
  }

  private static function serialize ($input, &$blacklist = []) {
    if (in_array($input, $blacklist)) {
      return '<Cyclic>';
    }

    if (is_object($input)) {
      array_push($blacklist, $input);
      $input = (array)$input;      
    }

    if (is_array($input)) {
      $input = self::sanitizeArrayKeys($input);

      foreach ($input as $key => $value) {
        if (is_object($value) || is_array($value)) {
          $input[$key] = self::serialize($value, $blacklist);
        }
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

  public function trace () {
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

    $this->write('trace', $trace);
  }
}
