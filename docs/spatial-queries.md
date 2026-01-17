# Spatial Queries

The API supports spatial queries using PostGIS functions. All coordinates use WGS84 (EPSG:4326).

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

## Coordinate Format

All coordinates use:
- `lat`: Latitude in decimal degrees (-90 to 90)
- `lng`: Longitude in decimal degrees (-180 to 180)

Example for Antananarivo:
```
lat=-18.8792
lng=47.5079
```

## PostGIS Functions Used

| Function | Purpose |
|----------|---------|
| `ST_Distance` | Calculate distance between geometries |
| `ST_DWithin` | Check if geometries are within a distance |
| `ST_Contains` | Check if one geometry contains another |
| `ST_SetSRID` | Set coordinate reference system |
| `ST_MakePoint` | Create a point from lat/lng |

## Geometry Format

Responses include geometry as GeoJSON. The database stores geometries as WKB (Well-Known Binary) and they are converted to GeoJSON in the response.

Example POI geometry:
```json
{
  "type": "Point",
  "coordinates": [47.5079, -18.8792]
}
```

Example Zone geometry:
```json
{
  "type": "Polygon",
  "coordinates": [[[...], [...], ...]]
}
```
