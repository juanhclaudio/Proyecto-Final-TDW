<?php

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../var/php_error.log');
error_reporting(E_ALL);

use TDW\IPanel\Utility\Utils;

$proyectBaseDir = dirname(__DIR__);
require_once $proyectBaseDir . '/vendor/autoload.php';

Utils::loadEnv($proyectBaseDir);

$app = (require $proyectBaseDir . '/config/bootstrap.php');
$app->addErrorMiddleware(true, true, true);
$app->run();