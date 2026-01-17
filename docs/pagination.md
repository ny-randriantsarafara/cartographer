# Cursor-Based Pagination

This API uses cursor-based pagination instead of offset-based pagination. Cursors provide stable pagination that works correctly even when data changes between requests.

## Why Cursors?

| Offset Pagination          | Cursor Pagination                    |
| -------------------------- | ------------------------------------ |
| `OFFSET 1000 LIMIT 20`     | `WHERE osm_id > 'last_id' LIMIT 20`  |
| Slow on large offsets      | Consistent performance               |
| Inconsistent with inserts  | Stable results                       |
| Simple to understand       | Slightly more complex                |

## Response Format

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
  "nextCursor": "bm9kZS8xMjM0NTY=",
  "hasMore": true
}
```

### Next Page

Use the `nextCursor` from the previous response:

```bash
GET /pois?limit=20&cursor=bm9kZS8xMjM0NTY=
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

```typescript
// Internal implementation
encodeCursor('node/123456'); // → 'bm9kZS8xMjM0NTY='
decodeCursor('bm9kZS8xMjM0NTY='); // → 'node/123456'
```

## Limits

- Default limit: 20
- Maximum limit: 100

```typescript
const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
```

## Edge Cases

### Empty Results

```json
{
  "items": [],
  "nextCursor": null,
  "hasMore": false
}
```

### Single Item Remaining

```json
{
  "items": [{ "osmId": "node/999999", ... }],
  "nextCursor": null,
  "hasMore": false
}
```

## Implementation Details

The pagination logic fetches `limit + 1` items to determine if there are more results:

```typescript
function buildCursorResponse<T extends { osmId: string }>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  const pageItems = hasMore ? items.slice(0, limit) : items;
  const lastItem = pageItems[pageItems.length - 1];
  const nextCursor = hasMore && lastItem ? encodeCursor(lastItem.osmId) : null;

  return { items: pageItems, nextCursor, hasMore };
}
```

## Best Practices

1. **Always use the cursor** - Don't try to construct cursors manually
2. **Check `hasMore`** - Stop pagination when `hasMore` is false
3. **Don't cache cursors** - They may become invalid after data changes
4. **Use consistent ordering** - Results are ordered by `osm_id` ascending
