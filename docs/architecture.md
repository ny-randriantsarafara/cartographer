# Hexagonal Architecture

This project follows hexagonal architecture (ports and adapters) to keep the core domain logic independent from external concerns like databases and HTTP frameworks.

## Layers

### Domain Layer (`src/domain/`)

The core of the application. Contains business entities and repository interfaces (ports). Has no dependencies on external libraries.

```
domain/
├── shared/        # Shared types (pagination, spatial, repository interface)
├── poi/           # POI entity and repository port
└── zone/          # Zone entity and repository port
```

Key concepts:
- **Entities**: `Poi` and `Zone` classes represent domain objects
- **Ports**: `PoiRepository` and `ZoneRepository` interfaces define what the domain needs
- **Value Objects**: `Point`, `CursorPage`, `CursorPaginationParams`

### Application Layer (`src/application/`)

Use cases that orchestrate domain operations. Each use case has a single responsibility.

```
application/
├── poi/           # GetPoiUseCase, ListPoisUseCase
└── zone/          # GetZoneUseCase, ListZonesUseCase
```

Use cases are thin because this is a read-only API. They simply delegate to repositories.

### Infrastructure Layer (`src/infrastructure/`)

Adapters that implement ports and handle external concerns.

```
infrastructure/
├── persistence/   # Kysely repository implementations
└── http/          # Fastify routes and controllers
```

Key components:
- **KyselyPoiRepository**: Implements `PoiRepository` using Kysely
- **KyselyZoneRepository**: Implements `ZoneRepository` using Kysely
- **Routes**: HTTP endpoints that use application use cases

## Dependency Flow

```
HTTP Request
    ↓
Routes (infrastructure/http)
    ↓
Use Cases (application)
    ↓
Repository Interface (domain) ← implemented by → Kysely Repository (infrastructure/persistence)
    ↓
Database
```

Dependencies point inward. The domain layer knows nothing about Kysely, Fastify, or any other library.

## Adding a New Entity

1. Create entity class in `domain/<entity>/<entity>.ts`
2. Create repository interface in `domain/<entity>/<entity>-repository.ts`
3. Create use cases in `application/<entity>/`
4. Implement repository in `infrastructure/persistence/kysely-<entity>-repository.ts`
5. Create routes in `infrastructure/http/routes/<entity>-routes.ts`
6. Wire up in `src/index.ts`
