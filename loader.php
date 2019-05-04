<?php

$node_dir = __DIR__ . DIRECTORY_SEPARATOR . 'logs' . DIRECTORY_SEPARATOR;

function node_log ($input) {
  global $node_dir;

  if (is_callable($input)) {
    ob_start();
    $input();
    $input = ob_get_clean();
  }

  if (!empty($input)) {
    $filename = (string)microtime(true);
    $filename = preg_replace('/[^\d]/', '-', $filename);
    file_put_contents($node_dir . $filename, $input);
  }
}

function node_dump (...$args) {
  node_log(function () use ($args) {
    foreach ($args as $value) {
      var_dump($value);
    }
  });
}

function node_trace () {
  node_log(function () {
    $trace = [];

    foreach (debug_backtrace() as $entry) {
      if (($entry['file'] ?? null) !== __FILE__) {
        array_push($trace, $entry);
      }
    }

    foreach ($trace as $key => $entry) {
      echo PHP_EOL;
      
      $file = ($entry['file'] ?? null);
      $line = ($entry['line'] ?? null);

      echo "$key: $file:$line";
    }
  });
}

node_log(':: ' . $_SERVER['SCRIPT_FILENAME'] . ' ::');
