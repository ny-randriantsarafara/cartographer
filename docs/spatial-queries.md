# Spatial Queries

The API supports spatial queries using PostGIS functions. All coordinates use WGS84 (EPSG:4326).

## Coordinate System

- **SRID 4326** (WGS84) - Standard GPS coordinates
- **Latitude** (lat): -90 to 90 (North/South)
- **Longitude** (lng): -180 to 180 (East/West)

**Important**: PostGIS uses `(lng, lat)` order internally, but the API accepts `lat` and `lng` as separate query parameters.

## Data Flow

```
API Request              PostGIS                      Response
lat=-18.9, lng=47.5  →  ST_MakePoint(47.5, -18.9)  →  GeoJSON
```

## POI Queries

### Near a Point

Find POIs ordered by distance from a point:

```bash
GET /pois?lat=-18.9&lng=47.5&limit=10
```

Uses `ST_Distance` to order results by proximity.

### Within a Radius

Find POIs within a specified distance (in meters):

```bash
GET /pois?lat=-18.9&lng=47.5&radius=5000&limit=10
```

Uses `ST_DWithin` to filter POIs within the radius, then orders by distance.

### Inside a Zone

Find POIs contained within a specific zone:

```bash
GET /zones/:zoneId/pois?limit=20
```

Uses `ST_Contains` to find POIs whose geometry falls within the zone's polygon.

## Zone Queries

### Containing a Point

Find all zones that contain a specific point:

```bash
GET /zones?lat=-18.9&lng=47.5
```

Returns zones ordered by area (smallest first), so you get the most specific zone first (e.g., district before region before country).

Uses `ST_Contains` to check if the point falls within each zone's polygon.

## PostGIS Functions Used

| Function       | Purpose                                  |
| -------------- | ---------------------------------------- |
| `ST_MakePoint` | Create a point from lng/lat              |
| `ST_SetSRID`   | Set coordinate reference system (4326)   |
| `ST_Distance`  | Calculate distance between geometries    |
| `ST_DWithin`   | Check if geometries are within a distance|
| `ST_Contains`  | Check if one geometry contains another   |

## Geometry vs Geography

PostGIS has two spatial types:

| Type        | Unit    | Speed  | Accuracy                   |
| ----------- | ------- | ------ | -------------------------- |
| `geometry`  | Degrees | Fast   | Flat Earth approximation   |
| `geography` | Meters  | Slower | Spherical calculations     |

**Our approach**:

- Store as `geometry` (efficient)
- Cast to `geography` for distance calculations (accurate)

```sql
-- Distance in meters (accurate)
ST_Distance(geometry::geography, point::geography)

-- Containment check (uses geometry, faster)
ST_Contains(geometry, point)
```

## Storage Format: WKB

PostGIS stores geometries as WKB (Well-Known Binary):

```
0101000020E610000000000000C0C34740CDCCCCCCCCDC32C0
│└──────┘│└──────┘└────────────────────────────────┘
│  type  │  SRID        coordinates (8 bytes each)
└─ endianness
```

The API converts WKB to GeoJSON for responses using the `wkx` library.

## Geometry Format in Responses

Example POI geometry (Point):

```json
{
  "type": "Point",
  "coordinates": [47.5079, -18.8792]
}
```

Example Zone geometry (Polygon):

```json
{
  "type": "Polygon",
  "coordinates": [[[47.5, -18.9], [47.6, -18.9], [47.6, -18.8], [47.5, -18.8], [47.5, -18.9]]]
}
```

## Examples

### Find restaurants within 500m

```bash
curl "http://localhost:3000/pois?lat=-18.9&lng=47.5&radius=500&category=food"
```

### Find district containing a point

```bash
curl "http://localhost:3000/zones?lat=-18.9&lng=47.5&type=district"
```

### Get all POIs in a specific zone

```bash
curl "http://localhost:3000/zones/relation/123456/pois"
```

## Performance Tips

1. **Use radius queries** instead of sorting all POIs by distance
2. **Add spatial indexes** on geometry columns:

   ```sql
   CREATE INDEX idx_pois_geometry ON pois USING GIST (geometry);
   CREATE INDEX idx_zones_geometry ON zones USING GIST (geometry);
   ```

3. **Use appropriate precision** - don't request more decimal places than needed
