<?php

/**
 * src/scripts/inicio.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

$projectRootDir = dirname(__DIR__, 2);
require_once $projectRootDir . '/vendor/autoload.php';

use TDW\IPanel\Utility\Utils;

Utils::loadEnv($projectRootDir);
echo ">> Reinstalando base de datos..." . PHP_EOL;
Utils::updateSchema();
echo ">> Esquema actualizado." . PHP_EOL;

$adminId = Utils::loadUserData(
    "juan@example.com",
    "juan1234",
    true,
    true,
    "Juan",
    "Claudio Plaza",
    "2004-04-30",
    ["https://github.com/juanhclaudio", "https://linkedin.com"]
);
echo ">> Admin creado (ID: $adminId)." . PHP_EOL;

$publicoId = Utils::loadUserData(
    "user@infopanel.com",
    "user1234",
    false,
    true,
    "Carlos",
    "Jiménez Saavedra",
    "1953-08-22",
    ["https://www.google.com", "https://es.wikipedia.org/wiki/"]
);
echo ">> Usuario público creado (ID: $publicoId)." . PHP_EOL;

$opIberiaId = Utils::loadOperatorData('Iberia', 'IB', '#d7192d', 'https://img.icons8.com/color/48/airplane-mode-on--v1.png');
echo ">> Operador Iberia creado (ID: $opIberiaId)." . PHP_EOL;

$opRenfeId = Utils::loadOperatorData('Renfe Ave', 'AVE', '#6e2b6e', 'https://img.icons8.com/color/48/train.png');
echo ">> Operador Renfe Ave creado (ID: $opRenfeId)." . PHP_EOL;

$opLufthansaId = Utils::loadOperatorData('Lufthansa', 'LH', '#002f5b', 'https://img.icons8.com/color/48/airplane-mode-on--v1.png');
echo ">> Operador Lufthansa creado (ID: $opLufthansaId)." . PHP_EOL;

$puertaT4Id = Utils::loadSpotData('PUERTA', 'T4-J45');
echo ">> Punto T4-J45 creado (ID: $puertaT4Id)." . PHP_EOL;

$puertaT1Id = Utils::loadSpotData('PUERTA', 'T1-C12');
echo ">> Punto T1-C12 creado (ID: $puertaT1Id)." . PHP_EOL;

$via7Id = Utils::loadSpotData('VIA', 'Vía 7');
echo ">> Punto Vía 7 creado (ID: $via7Id)." . PHP_EOL;

$via2Id = Utils::loadSpotData('VIA', 'Vía 2');
echo ">> Punto Vía 2 creado (ID: $via2Id)." . PHP_EOL;

$operacionesSeed = [
    [ 'tipo' => 'vuelo', 'sentido' => 'salida', 'codigo' => 'IB3120', 'origen' => 'Madrid', 'destino' => 'Londres', 'estado' => 'PROGRAMADO', 'operadorId' => $opIberiaId, 'puntoId' => $puertaT4Id, 'horaProgramada' => date('c', strtotime('+1 hour')), 'horaEstimada' => date('c', strtotime('+1 hour')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'salida', 'codigo' => 'IB1000', 'origen' => 'Madrid', 'destino' => 'París', 'estado' => 'EMBARCANDO', 'operadorId' => $opIberiaId, 'puntoId' => $puertaT4Id, 'horaProgramada' => date('c', strtotime('+30 minutes')), 'horaEstimada' => date('c', strtotime('+30 minutes')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'salida', 'codigo' => 'LH2500', 'origen' => 'Madrid', 'destino' => 'Berlín', 'estado' => 'RETRASADO', 'operadorId' => $opLufthansaId, 'puntoId' => $puertaT1Id, 'horaProgramada' => date('c', strtotime('+2 hours')), 'horaEstimada' => date('c', strtotime('+2 hours 20 minutes')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'salida', 'codigo' => 'IB0500', 'origen' => 'Madrid', 'destino' => 'Roma', 'estado' => 'CANCELADO', 'operadorId' => $opIberiaId, 'puntoId' => $puertaT4Id, 'horaProgramada' => date('c', strtotime('+15 minutes')), 'horaEstimada' => date('c', strtotime('+15 minutes')) ],
    [ 'tipo' => 'tren', 'sentido' => 'salida', 'codigo' => 'AVE4567', 'origen' => 'Madrid', 'destino' => 'Sevilla', 'estado' => 'PROGRAMADO', 'operadorId' => $opRenfeId, 'puntoId' => $via2Id, 'horaProgramada' => date('c', strtotime('+40 minutes')), 'horaEstimada' => date('c', strtotime('+40 minutes')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'llegada', 'codigo' => 'IB3333', 'origen' => 'Nueva York', 'destino' => 'Madrid', 'estado' => 'LLEGADO', 'operadorId' => $opIberiaId, 'puntoId' => $puertaT4Id, 'horaProgramada' => date('c', strtotime('-1 hour')), 'horaEstimada' => date('c', strtotime('-10 minutes')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'llegada', 'codigo' => 'LH2000', 'origen' => 'Frankfurt', 'destino' => 'Madrid', 'estado' => 'PROGRAMADO', 'operadorId' => $opLufthansaId, 'puntoId' => $puertaT1Id, 'horaProgramada' => date('c', strtotime('+50 minutes')), 'horaEstimada' => date('c', strtotime('+50 minutes')) ],
    [ 'tipo' => 'tren', 'sentido' => 'llegada', 'codigo' => 'AVE0312', 'origen' => 'Sevilla', 'destino' => 'Madrid', 'estado' => 'RETRASADO', 'operadorId' => $opRenfeId, 'puntoId' => $via7Id, 'horaProgramada' => date('c', strtotime('-30 minutes')), 'horaEstimada' => date('c', strtotime('+10 minutes')) ],
    [ 'tipo' => 'tren', 'sentido' => 'llegada', 'codigo' => 'AVE1122', 'origen' => 'Barcelona', 'destino' => 'Madrid', 'estado' => 'PROGRAMADO', 'operadorId' => $opRenfeId, 'puntoId' => $via7Id, 'horaProgramada' => date('c', strtotime('+1 hour 30 minutes')), 'horaEstimada' => date('c', strtotime('+1 hour 30 minutes')) ],
    [ 'tipo' => 'vuelo', 'sentido' => 'llegada', 'codigo' => 'IB4444', 'origen' => 'Tokio', 'destino' => 'Madrid', 'estado' => 'PROGRAMADO', 'operadorId' => $opIberiaId, 'puntoId' => $puertaT4Id, 'horaProgramada' => date('c', strtotime('+1 hour 10 minutes')), 'horaEstimada' => date('c', strtotime('+1 hour 10 minutes')) ]
];

foreach ($operacionesSeed as $opData) {
    $opId = Utils::loadOperationData($opData);
    echo ">> Operación " . $opData['codigo'] . " creada (ID: $opId)." . PHP_EOL;
}

echo ">> Proceso de carga inicial finalizado con éxito." . PHP_EOL;