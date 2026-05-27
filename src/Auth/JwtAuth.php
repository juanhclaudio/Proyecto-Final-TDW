<?php

/**
 * src/Auth/JwtAuth.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

declare(strict_types=1);

namespace TDW\IPanel\Auth;

use DateMalformedStringException;
use DateTimeImmutable;
use InvalidArgumentException;
use Lcobucci\JWT;
use Symfony\Component\Uid\Uuid;
use TDW\IPanel\Enum\Role;
use TDW\IPanel\Model\{User};

/**
 * Class JwtAuth
 *
 * JSON Web Token (JWT) - https://www.rfc-editor.org/rfc/rfc7519
 */
final readonly class JwtAuth
{
    /**
     * The constructor.
     *
     * @param JWT\Configuration $config
     * @param non-empty-string $issuer
     * @param non-empty-string $clientId OAuth2 client id.
     * @param non-negative-int $lifetime The max lifetime
     */
    public function __construct(
        private JWT\Configuration $config,
        private string            $issuer,
        private string            $clientId,
        private int               $lifetime
    ) {}

    /**
     * Get JWT max lifetime.
     *
     * @return int The lifetime in seconds
     */
    public function getLifetime(): int
    {
        return $this->lifetime;
    }

    /**
     * Create a JSON web token.
     *
     * @param User $user
     * @param array<string> $requestedScopes Requested scopes
     *
     * @return JWT\Token\Plain The JWT
     * @throws DateMalformedStringException
     */
    public function createJwt(User $user, array $requestedScopes = Role::ALL_VALUES): JWT\Token\Plain
    {
        $userRoles = array_map(fn($r) => $r->value, $user->getRoles());

        $awardedScopes = array_filter(
            array_unique(array_merge($requestedScopes, $userRoles)),
            fn($role) => $user->hasRole($role),
        );

        $primaryRole = in_array(Role::GESTOR->value, $userRoles, true) ? Role::GESTOR->value : Role::PUBLICO->value;

        $now = new DateTimeImmutable('@' . time());

        $token = $this->config->builder()
            ->issuedBy($this->issuer)
            ->permittedFor($this->clientId)
            ->identifiedBy(Uuid::v4()->toRfc4122())
            ->issuedAt($now)
            ->canOnlyBeUsedAfter($now)
            ->expiresAt($now->modify('+' . $this->lifetime . ' seconds'))
            ->relatedTo((string) $user->getId()) 
            ->withClaim('scopes', array_values($awardedScopes))
            ->withClaim('role', $primaryRole)
            ->withClaim('email', $user->getEmail()) 
            ->withClaim('uid', $user->getId())
            ->withClaim('id', $user->getId()) 
            ->getToken($this->config->signer(), $this->config->signingKey());

        return $token;
    }

    /**
     * Parse token.
     *
     * @param non-empty-string $token The JWT
     *
     * @return JWT\Token The parsed token
     */
    public function createParsedToken(string $token): JWT\Token
    {
        assert($token !== '');
        return $this->config->parser()->parse($token);
    }

    /**
     * Validate the access token.
     *
     * @param non-empty-string $accessToken The JWT
     *
     * @return true The status
     * @throws InvalidArgumentException
     */
    public function validateToken(string $accessToken): bool
    {
        assert($accessToken !== '');

        $token = $this->config->parser()->parse($accessToken);

        if (! $this->config->validator()->validate($token, ...$this->config->validationConstraints())) {
            throw new InvalidArgumentException('Invalid token provided');
        }

        return true;
    }
}
