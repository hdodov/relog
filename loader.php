<?php

$node_log_file = __DIR__ . DIRECTORY_SEPARATOR . 'input.txt';

function node_log ($input) {
  global $node_log_file;

  if (!empty($input)) {
    file_put_contents($node_log_file, $input . PHP_EOL, FILE_APPEND | LOCK_EX);
  }
}

function node_trace () {
  ob_start();
  $trace = debug_backtrace();

  foreach ($trace as $key => $entry) {
    if ($key > 0) {
      echo PHP_EOL;
    }

    echo $key . ': ' . ($entry['file'] ?? null) . ':' . ($entry['line'] ?? null);
  }

  $buffer = ob_get_clean();
  node_log($buffer);
}
