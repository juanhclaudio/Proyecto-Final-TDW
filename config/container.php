<?php

use Doctrine\ORM\EntityManager;
use Lcobucci\Clock\SystemClock;
use Lcobucci\JWT\Signer;
use Lcobucci\JWT\Signer\Hmac\Sha256; // Cambiado a HMAC
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Validation\Constraint\{HasClaim, IssuedBy, PermittedFor, SignedWith, StrictValidAt};
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Logger;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Log\LoggerInterface;
use Slim\App;
use Slim\Factory\AppFactory;
use Slim\Interfaces\RouteParserInterface;
use TDW\IPanel\Auth\JwtAuth;
use TDW\IPanel\Utility\DoctrineConnector;

return [
    'settings' => fn() => require __DIR__ . '/settings.php',

    App::class => function (ContainerInterface $container) {
        AppFactory::setContainer($container);
        return AppFactory::create();
    },

    ResponseFactoryInterface::class => fn(ContainerInterface $container) => $container->get(App::class)->getResponseFactory(),

    RouteParserInterface::class => fn(ContainerInterface $container) => $container->get(App::class)->getRouteCollector()->getRouteParser(),

    LoggerInterface::class => function (ContainerInterface $container) {
        $settings = $container->get('settings')['logger'];
        $logger = new Logger('app');
        $filename = sprintf('%s/app.log', $settings['path']);
        $rotatingFileHandler = new RotatingFileHandler($filename, 0, $settings['level'], true, 0777);
        $rotatingFileHandler->setFormatter(new LineFormatter(null, null, false, true));
        $logger->pushHandler($rotatingFileHandler);
        return $logger;
    },

    EntityManager::class => DoctrineConnector::getEntityManager(),

    JwtAuth::class => function (ContainerInterface $container) {
        $settings = $container->get('settings');
        $issuer = $settings['jwt']['issuer'];
        $clientId = $settings['jwt']['client-id'];
        $lifetime = $settings['jwt']['lifetime'];
        
        $key = InMemory::plainText($_ENV['JWT_SECRET']);
        $signer = new Sha256();

        $jwtConfig = Lcobucci\JWT\Configuration::forSymmetricSigner($signer, $key);

        $jwtConfig->setValidationConstraints(
            new IssuedBy($issuer),
            new PermittedFor($clientId),
            new SignedWith($signer, $key),
            new StrictValidAt(SystemClock::fromSystemTimezone()),
            new HasClaim('uid'),
            new HasClaim('email'),
            new HasClaim('scopes'),
        );

        return new JwtAuth($jwtConfig, $issuer, $clientId, $lifetime);
    },
];