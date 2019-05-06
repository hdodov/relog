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

  private static function serialize ($input, &$ignored = []) {
    if (in_array($input, $ignored)) {
      return '<Cyclic>';
    }

    if (is_object($input)) {
      array_push($ignored, $input);
      $input = (array)$input;      
    }

    if (is_array($input)) {
      foreach ($input as $key => $value) {
        $parsedKey = preg_replace('/[^A-Za-z0-9_-]/', '', $key);

        if ($parsedKey !== $key) {
          unset($input[$key]);
          $input[$parsedKey] = $value;
          $key = $parsedKey;
        }

        if (is_object($value) || is_array($value)) {
          $input[$key] = self::serialize($value, $ignored);
        }
      }
    }

    return $input;
  }

  public static function is_closure ($value) {
    return is_object($value) && ($value instanceof Closure);
  }

  public function log (...$args) {
    $input = [];

    foreach ($args as $arg) {
      if (self::is_closure($arg)) {
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