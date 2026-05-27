<?php

/**
 * src/Controller/User/CreateCommand.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\IPanel\Controller\User;

use Doctrine\ORM;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Http\Response;
use TDW\IPanel\Controller\TraitController;
use TDW\IPanel\Model\User;
use TDW\IPanel\Utility\Error;
use Throwable;

class CreateCommand
{
    use TraitController;

    public function __construct(
        private readonly ORM\EntityManager $entityManager
    ) { }

    /**
     * POST /api/v1/users
     *
     * @throws ORM\Exception\ORMException
     */
    public function __invoke(Request $request, Response $response): Response
    {
        assert($request->getMethod() === 'POST');
        /** @var array<string, mixed> $req_data */
        $req_data = $request->getParsedBody() ?? [];

        if (
            !isset($req_data['email'], $req_data['password']) ||
            !is_string($req_data['email']) ||
            !is_string($req_data['password']) ||
            !$this->verifyStringInput($req_data['email'], 60)
        ) { // 422
            return Error::createResponse($response, StatusCode::STATUS_UNPROCESSABLE_ENTITY);
        }

        $userRepository = $this->entityManager->getRepository(User::class);
        if (0 !== $this->findByAttribute($userRepository, 'email', $req_data['email'])) {
            return Error::createResponse($response, StatusCode::STATUS_BAD_REQUEST);
        }

        try {
            assert(strlen($req_data['email']) > 0);
            $user = new User(
                email: $req_data['email'],
                password: $req_data['password']
            );

            // Populate expanded demographics safely
            if (isset($req_data['nombre']) && is_string($req_data['nombre'])) {
                $user->setNombre(substr($req_data['nombre'], 0, 120));
            }
            if (isset($req_data['apellidos']) && is_string($req_data['apellidos'])) {
                $user->setApellidos(substr($req_data['apellidos'], 0, 120));
            }
            if (isset($req_data['fechaNacimiento']) && is_string($req_data['fechaNacimiento'])) {
                $user->setFechaNacimiento(new \DateTime($req_data['fechaNacimiento']));
            }
            if (isset($req_data['urlsInteres']) && is_array($req_data['urlsInteres'])) {
                $urls = array_filter($req_data['urlsInteres'], 'is_string');
                $user->setUrlsInteres(array_values($urls));
            }

        } catch (Throwable) {    // 400 BAD REQUEST: Unexpected format
            return Error::createResponse($response, StatusCode::STATUS_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $response
            ->withAddedHeader('Location', $request->getUri() . '/' . $user->getId())
            ->withJson($user, StatusCode::STATUS_CREATED);
    }
}