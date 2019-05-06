<?php

$node_handle = fopen(__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'php.log', 'a');
$node_id = rand();
header('X-Relog: ' . $node_id);

function node_log ($input) {
  global $node_handle, $node_id;

  if (is_callable($input)) {
    ob_start();
    $input();
    $input = ob_get_clean();
  }

  $log = [
    'script_id' => (string)$node_id,
    'time' => microtime(true),
    'data' => $input
  ];

  if (!empty($input)) {
    fwrite($node_handle, json_encode($log) . PHP_EOL);
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
