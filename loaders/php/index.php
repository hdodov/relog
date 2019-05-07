<?php

include __DIR__ . DIRECTORY_SEPARATOR . 'Logger.php';

function relog (...$args) {
  global $relog_logger;

  if (!$relog_logger) {
    throw new Exception('Relog logger does not exist.');
  }

  if (count($args) === 0) {
    return $relog_logger;
  } else {
    call_user_func_array([$relog_logger, 'log'], $args);
  }
}

$relog_file = realpath(__DIR__ . '/../../data/') . DIRECTORY_SEPARATOR . 'php.log';
$relog_handle = fopen($relog_file, 'a');

if ($relog_handle) {
  $relog_logger = new Relog\Logger($relog_handle);
}
