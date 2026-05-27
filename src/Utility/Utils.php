<?php

/**
 * src/Utility/Utils.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\IPanel\Utility;

use Doctrine\ORM\{EntityManager, Tools\SchemaTool};
use Dotenv\Dotenv;
use TDW\IPanel\Enum\{Role, TipoOperacion, SentidoOperacion, EstadoOperacion, TipoPunto};
use TDW\IPanel\Model\{User, Operador, Punto, Operacion};
use Throwable;
use DateTime;

/**
 * Class Utils
 */
class Utils
{
    /**
     * Load the environment/configuration variables
     */
    public static function loadEnv(string $dir): void
    {
        require_once $dir . '/vendor/autoload.php';

        if (!class_exists(Dotenv::class)) {
            fwrite(STDERR, 'ERROR: No se ha cargado la clase Dotenv' . PHP_EOL);
            exit(1);
        }

        try {
            if (file_exists($dir . '/.env')) {
                $dotenv = Dotenv::createMutable($dir, '.env');
                $dotenv->load();
            } else {
                fwrite(STDERR, 'ERROR: no existe el fichero .env' . PHP_EOL);
                exit(1);
            }

            if (isset($_SERVER['DOCKER']) && file_exists($dir . '/.env.docker')) {
                $dotenv = Dotenv::createMutable($dir, '.env.docker');
                $dotenv->load();
            } elseif (file_exists($dir . '/.env.local')) {
                $dotenv = Dotenv::createMutable($dir, '.env.local');
                $dotenv->load();
            }

            $dotenv->required([ 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWD', 'SERVER_VERSION' ]);
            $dotenv->required([ 'ENTITY_DIR' ]);
        } catch (Throwable $e) {
            fwrite(STDERR, 'EXCEPCIÓN: ' . $e->getCode() . ' - ' . $e->getMessage());
            exit(1);
        }
    }

    /**
     * Drop & Update database schema
     */
    public static function updateSchema(): void
    {
        try {
            /** @var EntityManager $e_manager */
            $e_manager = DoctrineConnector::getEntityManager();
            $e_manager->clear();
            $metadata = $e_manager->getMetadataFactory()->getAllMetadata();
            $sch_tool = new SchemaTool($e_manager);
            $sch_tool->dropDatabase();
            $sch_tool->updateSchema($metadata);
        } catch (Throwable $e) {
            fwrite(STDERR, 'EXCEPCIÓN: ' . $e->getCode() . ' - ' . $e->getMessage());
            exit(1);
        }
    }

    /**
     * Load user data fixtures
     *
     * @param string $email user email
     * @param string $password user password
     * @param bool $gestor isAdmin
     * @param bool $activo user active status
     * @param string|null $nombre user name
     * @param string|null $apellidos user surname
     * @param string|null $fechaNacimiento user birthdate (format: 'Y-m-d')
     * @param string[] $urlsInteres array of interesting urls
     *
     * @return int user_id
     */
    public static function loadUserData(
        string $email,
        string $password,
        bool $gestor = false,
        bool $activo = true,
        ?string $nombre = null,
        ?string $apellidos = null,
        ?string $fechaNacimiento = null,
        array $urlsInteres = []
    ): int {
        assert($email !== '');
        $user = new User(
            email: $email,
            password: $password,
            role: $gestor ? Role::GESTOR : Role::PUBLICO
        );
        
        $user->setActivo($activo);
        $user->setNombre($nombre);
        $user->setApellidos($apellidos);
        
        if ($fechaNacimiento !== null) {
            $user->setFechaNacimiento(new \DateTime($fechaNacimiento));
        }
        
        $user->setUrlsInteres($urlsInteres);

        try {
            $e_manager = DoctrineConnector::getEntityManager();
            $e_manager->persist($user);
            $e_manager->flush();
        } catch (Throwable $e) {
            fwrite(
                STDERR,
                'EXCEPCIÓN User: ' . $e->getCode() . ' - ' . $e->getMessage() . PHP_EOL
            );
            exit(1);
        }

        return $user->getId();
    }
    
    public static function loadOperatorData(string $nombre, string $siglas, ?string $color = null, ?string $urlIcono = null): int 
    {
        $entityManager = DoctrineConnector::getEntityManager();
        $operator = new Operador($nombre, $siglas, $color, $urlIcono);
        $entityManager->persist($operator);
        $entityManager->flush();
        return $operator->getId();
    }

    public static function loadSpotData(string $tipo, string $codigo): int 
    {
        $entityManager = DoctrineConnector::getEntityManager();
        $tipoPunto = TipoPunto::from(strtoupper($tipo));
        $spot = new Punto($tipoPunto, $codigo);
        $entityManager->persist($spot);
        $entityManager->flush();
        return $spot->getId();
    }

    public static function loadOperationData(array $data): string
    {
        $entityManager = DoctrineConnector::getEntityManager();
        $operador = $entityManager->getRepository(Operador::class)->find($data['operadorId']);
        $punto = $entityManager->getRepository(Punto::class)->find($data['puntoId']);
        
        if (!$operador || !$punto) {
            throw new \Exception("Operador o Punto no encontrados para la operación " . $data['codigo']);
        }

        $operacion = new Operacion(
            TipoOperacion::from(strtolower($data['tipo'])),
            $data['codigo'],
            SentidoOperacion::from(strtolower($data['sentido'])),
            $data['origen'],
            $data['destino'],
            $operador,
            $punto,
            EstadoOperacion::from(strtolower($data['estado'] ?? 'programado')),
            isset($data['horaProgramada']) ? new DateTime($data['horaProgramada']) : null,
            isset($data['horaEstimada']) ? new DateTime($data['horaEstimada']) : null
        );
        
        $entityManager->persist($operacion);
        $entityManager->flush();
        return $operacion->getId();
    }
}