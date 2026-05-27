<?php

/**
 * src/Controller/User/UpdateCommand.php
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

class UpdateCommand
{
    use TraitController;

    public const string PATH_USERS = '/users';

    public function __construct(
        private readonly ORM\EntityManager $entityManager
    ) { }

    /**
     * PUT /api/v1/users/{userId}
     *
     * @throws ORM\Exception\ORMException
     */
    public function __invoke(Request $request, Response $response, array $args): Response
    {
        assert($request->getMethod() === 'PUT');
        $isGestor = $this->checkGestorScope($request);
        $userRequestId = $this->getUserId($request);
        
        $targetUserId = intval($args['userId'] ?? 0);

        if (!$isGestor && $targetUserId !== $userRequestId) {
            return Error::createResponse($response, StatusCode::STATUS_NOT_FOUND); 
        }

        if (!$this->verifyInputId($targetUserId)) { 
            return Error::createResponse($response, StatusCode::STATUS_NOT_FOUND);
        }

        /** @var array<string, mixed> $req_data */
        $req_data = $request->getParsedBody() ?? [];
        $this->entityManager->beginTransaction();
        
        $userToModify = $this->entityManager->getRepository(User::class)->find($targetUserId);

        if (!$userToModify instanceof User) {   
            $this->entityManager->rollback();
            return Error::createResponse($response, StatusCode::STATUS_NOT_FOUND);
        }

        $etag = md5(json_encode($userToModify) . $userToModify->getPassword());
        if (!in_array($etag, $request->getHeader('If-Match'), true)) {
            $this->entityManager->rollback();
            return Error::createResponse($response, StatusCode::STATUS_PRECONDITION_REQUIRED);
        }

        if (isset($req_data['email']) && is_string($req_data['email']) && $this->verifyStringInput($req_data['email'], 60)) {
            $usuarioId = $this->findByAttribute(
                $this->entityManager->getRepository(User::class),
                'email',
                $req_data['email']
            );
            if (($usuarioId !== 0) && $targetUserId !== $usuarioId) {
                $this->entityManager->rollback();
                return Error::createResponse($response, StatusCode::STATUS_BAD_REQUEST);
            }
            $userToModify->setEmail($req_data['email']);
        }
        $this->updatePassword($req_data, $userToModify);

        // Standard profile updates (Available to owner or Gestor)
        try {
            if (isset($req_data['nombre']) && is_string($req_data['nombre'])) {
                $userToModify->setNombre(substr($req_data['nombre'], 0, 120));
            }
            if (isset($req_data['apellidos']) && is_string($req_data['apellidos'])) {
                $userToModify->setApellidos(substr($req_data['apellidos'], 0, 120));
            }
            if (isset($req_data['fechaNacimiento']) && is_string($req_data['fechaNacimiento'])) {
                $userToModify->setFechaNacimiento(new \DateTime($req_data['fechaNacimiento']));
            }
            if (isset($req_data['urlsInteres']) && is_array($req_data['urlsInteres'])) {
                $urls = array_filter($req_data['urlsInteres'], 'is_string');
                $userToModify->setUrlsInteres(array_values($urls));
            }

            // GESTOR ONLY operations
            if ($isGestor) {
                if (isset($req_data['role']) && is_string($req_data['role'])) {
                    $userToModify->setRole($req_data['role']);
                }
                if (isset($req_data['activo'])) {
                    $userToModify->setActivo((bool) $req_data['activo']);
                }
            }
        } catch (Throwable) {    
            $this->entityManager->rollback();
            return Error::createResponse($response, StatusCode::STATUS_BAD_REQUEST);
        }

        $this->entityManager->flush();
        $this->entityManager->commit();

        return $response->withJson($userToModify, 209);
    }

    /**
     * @param array<string, mixed> $req_data
     */
    private function updatePassword(array $req_data, User $userToModify): void
    {
        if (isset($req_data['password']) && is_string($req_data['password'])) {
            $userToModify->setPassword($req_data['password']);
        }
    }
}