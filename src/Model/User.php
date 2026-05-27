<?php

declare(strict_types=1);

/**
 * src/Model/User.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\IPanel\Model;

use DateTime;
use Doctrine\ORM\Mapping as ORM;
use InvalidArgumentException;
use JetBrains\PhpStorm\ArrayShape;
use JsonSerializable;
use ReflectionObject;
use Stringable;
use TDW\IPanel\Enum\Role;
use ValueError;

#[ORM\Entity, ORM\Table(name: 'users')]
class User implements JsonSerializable, Stringable
{
    #[ORM\Id,
    ORM\Column(
        name: 'id',
        type: 'integer',
        nullable: false
    ),
    ORM\GeneratedValue(strategy: 'IDENTITY')]
    protected int $id;

    #[ORM\Column(
        name: 'email',
        type: 'string',
        length: 60,
        unique: true,
        nullable: false
    )]
    protected string $email;

    #[ORM\Column(
        name: 'password',
        type: 'string',
        length: 255,
        nullable: false
    )]
    protected string $password_hash;

    #[ORM\Column(
        name: 'role',
        type: 'enum',
        length: 10,
        nullable: false,
        enumType: Role::class,
        options: ['default' => Role::PUBLICO]
    )]
    protected Role $role;

    #[ORM\Column(
        name: 'activo',
        type: 'boolean',
        nullable: false,
        options: ['default' => true]
    )]
    protected bool $activo = true;

    #[ORM\Column(
        name: 'nombre',
        type: 'string',
        length: 120,
        nullable: true
    )]
    protected ?string $nombre;

    #[ORM\Column(
        name: 'apellidos',
        type: 'string',
        length: 120,
        nullable: true
    )]
    protected ?string $apellidos;

    #[ORM\Column(
        name: 'fecha_nacimiento',
        type: 'datetime',
        nullable: true
    )]
    protected ?DateTime $fechaNacimiento;

    /** @var array<string>|null */
    #[ORM\Column(
        name: 'urls_interes',
        type: 'json',
        nullable: true
    )]
    protected ?array $urlsInteres;

    /**
     * User constructor.
     *
     * @param non-empty-string $email user email
     * @param string $password user password
     * @param Role|string $role Role::*
     *
     * @throws InvalidArgumentException
     */
    public function __construct(
        string $email = '<empty>',
        string $password = '',
        Role|string $role = Role::PUBLICO
    ) {
        assert($email !== '', InvalidArgumentException::class);
        $this->id              = 0;
        $this->email           = $email;
        $this->setPassword($password);
        $this->setRole($role);
        
        // Expanded demographic initializations
        $this->activo          = true;
        $this->nombre          = null;
        $this->apellidos       = null;
        $this->fechaNacimiento = null;
        $this->urlsInteres     = [];
    }

    /**
     * Gets the user ID
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Get user e-mail
     */
    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * Set user e-mail
     *
     * @throws InvalidArgumentException if the email is empty
     */
    public function setEmail(string $email): void
    {
        assert($email !== '', InvalidArgumentException::class);
        $this->email = $email;
    }

    /**
     * Get the hashed password
     */
    public function getPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Set the user's password
     */
    public function setPassword(string $password): void
    {
        $this->password_hash = password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Verifies that the given hash matches the user password.
     */
    public function validatePassword(string $password): bool
    {
        return password_verify($password, $this->getPassword());
    }

    /**
     * Determines whether the user has a certain role
     */
    public function hasRole(Role|string $role): bool
    {
        if (!$role instanceof Role) {
            $role = Role::tryFrom($role);
        }
        return match ($role) {
            Role::INACTIVO => $this->role->is(Role::INACTIVO),
            Role::PUBLICO  => !$this->role->is(Role::INACTIVO),
            Role::GESTOR   => $this->role->is(Role::GESTOR),
            default        => false
        };
    }

    /**
     * Assign the role to the user
     *
     * @throws InvalidArgumentException if the role is invalid
     */
    public function setRole(Role|string $newRole): void
    {
        try {
            $this->role = ($newRole instanceof Role)
                ? $newRole
                : Role::from(strtolower($newRole));
        } catch (ValueError) {
            throw new InvalidArgumentException('Invalid Role');
        }
    }

    /**
     * Returns an array with the user's roles
     *
     * @return Role[]
     */
    public function getRoles(): array
    {
        return array_values(array_filter(
            Role::cases(),
            fn($myRole) => $this->hasRole($myRole)
        ));
    }

    /**
     * Get user active status (Soft-Lock flag)
     */
    public function isActivo(): bool
    {
        return $this->activo;
    }

    /**
     * Set user active status
     */
    public function setActivo(bool $activo): void
    {
        $this->activo = $activo;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(?string $nombre): void
    {
        $this->nombre = $nombre;
    }

    public function getApellidos(): ?string
    {
        return $this->apellidos;
    }

    public function setApellidos(?string $apellidos): void
    {
        $this->apellidos = $apellidos;
    }

    public function getFechaNacimiento(): ?DateTime
    {
        return $this->fechaNacimiento;
    }

    public function setFechaNacimiento(?DateTime $fechaNacimiento): void
    {
        $this->fechaNacimiento = $fechaNacimiento;
    }

    /**
     * @return string[]
     */
    public function getUrlsInteres(): array
    {
        return $this->urlsInteres ?? [];
    }

    /**
     * @param string[] $urlsInteres
     */
    public function setUrlsInteres(?array $urlsInteres): void
    {
        $this->urlsInteres = $urlsInteres;
    }

    /** @see Stringable */
    public function __toString(): string
    {
        $reflection = new ReflectionObject($this);
        return sprintf(
            '[%s: (id=%04d, email="%s", role="%s", activo="%s", nombre="%s", apellidos="%s")]',
            $reflection->getShortName(),
            $this->getId(),
            $this->getEmail(),
            $this->role->name,
            $this->isActivo() ? 'true' : 'false',
            $this->getNombre() ?? 'null',
            $this->getApellidos() ?? 'null'
        );
    }

    /**
     * @see JsonSerializable
     */
    #[ArrayShape(['user' => 'array'])]
    public function jsonSerialize(): mixed
    {
        $reflection = new ReflectionObject($this);
        return [
            strtolower($reflection->getShortName()) => [
                'id'              => $this->getId(),
                'email'           => $this->getEmail(),
                'role'            => $this->role->name,
                'activo'          => $this->isActivo(),
                'nombre'          => $this->getNombre(),
                'apellidos'       => $this->getApellidos(),
                'fechaNacimiento' => $this->getFechaNacimiento()?->format('Y-m-d'),
                'urlsInteres'     => $this->getUrlsInteres(),
            ]
        ];
    }
}
