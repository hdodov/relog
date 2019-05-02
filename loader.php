<?php

$node_handle = fopen(__DIR__ . DIRECTORY_SEPARATOR . 'input.txt', 'a');

function node_log ($input) {
  global $node_handle;

  if (is_callable($input)) {
    ob_start();
    $input();
    $input = ob_get_clean();
  }

  if (!empty($input)) {
    fwrite($node_handle, $input . PHP_EOL);
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

node_log(':: ' . microtime(true) . ' ' . $_SERVER['SCRIPT_FILENAME'] . ' ::');
