# Cartographer

A read-only REST API for querying Points of Interest (POIs) and administrative zones in Madagascar. Built with Fastify and TypeScript using clean architecture.

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify 5
- **Database**: PostgreSQL with PostGIS
- **Query Builder**: Kysely
- **Testing**: Vitest
- **Code Style**: Prettier + ESLint

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure

```
src/
├── domain/                    # Business entities and interfaces
│   ├── models/               # Poi, Zone entities
│   ├── object-values/        # Point, RadiusQuery, Pagination
│   └── repositories/         # Repository interfaces
├── application/              # Use cases
│   └── use-cases/
│       ├── poi/              # GetPoiUseCase, ListPoisUseCase
│       └── zone/             # GetZoneUseCase, ListZonesUseCase
├── infrastructure/           # External concerns
│   ├── http/routes/          # Fastify route handlers
│   ├── persistence/          # Kysely repositories, geometry utils
│   └── container.ts          # Dependency injection
├── config/                   # Environment configuration
└── index.ts                  # Entry point
```

## Endpoints

### Health

- `GET /health` - Server health check

### POIs

- `GET /pois` - List all POIs
- `GET /pois?category=food` - Filter by category
- `GET /pois?lat=-18.9&lng=47.5` - POIs near a point (ordered by distance)
- `GET /pois?lat=-18.9&lng=47.5&radius=5000` - POIs within radius (meters)
- `GET /pois/:id` - Get single POI

### Zones

- `GET /zones` - List all zones
- `GET /zones?type=district` - Filter by zone type
- `GET /zones?lat=-18.9&lng=47.5` - Zones containing a point
- `GET /zones/:id` - Get single zone
- `GET /zones/:id/pois` - POIs inside a zone

### Pagination

All list endpoints support cursor-based pagination:

```
GET /pois?limit=20
GET /pois?limit=20&cursor=<nextCursor>
```

Response format:

```json
{
  "items": [...],
  "nextCursor": "base64string",
  "hasMore": true
}
```

## Scripts

```bash
npm run dev           # Development server with hot reload
npm run build         # Compile TypeScript
npm start             # Run production build
npm run typecheck     # Type checking
npm run lint          # ESLint
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
```

## Code Style

Configured with Prettier:

- Single quotes
- 120 character line width
- Trailing commas everywhere
- 2 space indentation

Run `npm run format` to format all files.

## Documentation

- [Architecture](docs/architecture.md) - Clean architecture overview
- [Pagination](docs/pagination.md) - Cursor-based pagination
- [Spatial Queries](docs/spatial-queries.md) - PostGIS spatial queries

## API Documentation

Swagger UI available at `/documentation` when running the server.

## License

MIT
