# Clean Architecture

This project follows clean architecture principles to keep the core domain logic independent from external concerns like databases and HTTP frameworks.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Infrastructure                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  Application                     │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │                Domain                    │    │    │
│  │  │  • Entities (Poi, Zone)                 │    │    │
│  │  │  • Repository interfaces                │    │    │
│  │  │  • Value objects (Point, RadiusQuery)   │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  │  • Use cases (GetPoi, ListZones, etc.)          │    │
│  └─────────────────────────────────────────────────┘    │
│  • HTTP routes (Fastify)                                │
│  • Database repositories (Kysely + PostGIS)             │
│  • Dependency injection container                       │
└─────────────────────────────────────────────────────────┘
```

### Domain Layer (`src/domain/`)

The core of the application. Contains business entities and repository interfaces (ports). Has no dependencies on external libraries.

```
domain/
├── models/           # Poi and Zone entities
├── object-values/    # Point, RadiusQuery, CursorPage, CursorPaginationParams
└── repositories/     # Repository interfaces (ReadRepository, PoiRepository, ZoneRepository)
```

Key concepts:

- **Entities**: `Poi` and `Zone` classes represent domain objects
- **Ports**: `PoiRepository` and `ZoneRepository` interfaces define what the domain needs
- **Value Objects**: `Point`, `RadiusQuery`, `CursorPage`, `CursorPaginationParams`

### Application Layer (`src/application/`)

Use cases that orchestrate domain operations. Each use case has a single responsibility.

```
application/
└── use-cases/
    ├── poi/    # GetPoiUseCase, ListPoisUseCase
    └── zone/   # GetZoneUseCase, ListZonesUseCase
```

Use cases are thin because this is a read-only API. They simply delegate to repositories.

### Infrastructure Layer (`src/infrastructure/`)

Adapters that implement ports and handle external concerns.

```
infrastructure/
├── persistence/          # Kysely repository implementations
│   ├── database.ts       # Database connection
│   ├── schema.ts         # Database types
│   ├── geometry.ts       # WKB to GeoJSON conversion
│   ├── cursor-pagination.ts
│   ├── kysely-poi-repository.ts
│   └── kysely-zone-repository.ts
├── http/
│   └── routes/           # Fastify route handlers
└── container.ts          # Dependency injection
```

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

## Dependency Injection

The container (`infrastructure/container.ts`) wires everything together with lazy initialization:

```typescript
const container = createContainer(db);

// Routes receive only the use cases they need
createPoiRoutes({
  getPoi: container.useCases.getPoi,
  listPois: container.useCases.listPois,
});
```

## Adding a New Entity

1. Create entity class in `domain/models/<entity>.ts`
2. Create repository interface in `domain/repositories/<entity>-repository.ts`
3. Export from `domain/repositories/index.ts`
4. Create use cases in `application/use-cases/<entity>/`
5. Export from `application/use-cases/index.ts`
6. Implement repository in `infrastructure/persistence/kysely-<entity>-repository.ts`
7. Create routes in `infrastructure/http/routes/<entity>-routes.ts`
8. Wire up in container and `src/index.ts`

## Testing

Unit tests are located alongside the code they test:

```
infrastructure/persistence/__tests__/
├── cursor-pagination.test.ts
└── geometry.test.ts
```

Run tests with:

```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```
