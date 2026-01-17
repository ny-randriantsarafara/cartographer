# Cursor-Based Pagination

This API uses cursor-based pagination instead of offset-based pagination. Cursors provide stable pagination that works correctly even when data changes between requests.

## How It Works

Each paginated response includes:
- `items`: The current page of results
- `nextCursor`: An opaque string to fetch the next page (null if no more pages)
- `hasMore`: Boolean indicating if more results exist

## Usage

### First Page

```bash
GET /pois?limit=20
```

Response:
```json
{
  "items": [...],
  "nextCursor": "NTg4OTgxODU3",
  "hasMore": true
}
```

### Next Page

Use the `nextCursor` from the previous response:

```bash
GET /pois?limit=20&cursor=NTg4OTgxODU3
```

### Last Page

When `hasMore` is false, you've reached the end:

```json
{
  "items": [...],
  "nextCursor": null,
  "hasMore": false
}
```

## Cursor Format

Cursors are base64-encoded OSM IDs. They are opaque to clients - don't parse or construct them manually. Always use the `nextCursor` from the previous response.

## Why Cursors?

Offset pagination breaks when data changes:
- If items are inserted before your offset, you'll see duplicates
- If items are deleted, you'll skip items

Cursor pagination uses a stable reference point (the last seen ID) so you always get consistent results.

## Limits

- Default limit: 20
- Maximum limit: 100
