# River Water Level Tracker — USGS Real-Time Gauge Data

Get real-time river and stream gauge readings from official USGS
monitoring stations, by state or by specific site numbers. Results are
sorted highest-reading-first, so the sites closest to flood/high-water
risk surface at the top without needing a separate flood-stage lookup.

Built for field-operations, logistics, agriculture, and insurance teams
who need current water-level conditions, not a forecast.

## Input

```json
{
  "stateCode": "CO",
  "siteNumbers": "",
  "parameter": "gaugeHeight",
  "minValue": null,
  "maxResults": 50
}
```

| Field | Type | Description |
|---|---|---|
| `stateCode` | string | Two-letter US state code to survey all active sites in. Ignored if `siteNumbers` is set. |
| `siteNumbers` | string (optional) | Comma-separated USGS site numbers to check instead of a whole state, e.g. `"07227420,09404200"`. |
| `parameter` | string | `"gaugeHeight"` (water surface elevation, feet) or `"streamflow"` (discharge, cubic feet per second). Default `"gaugeHeight"`. |
| `minValue` | number (optional) | Only return sites at or above this reading. Leave blank to return all sites. |
| `maxResults` | number | Max sites to return, highest reading first. Default `50`, max `200`. |

Either `stateCode` or `siteNumbers` is required.

## Output

One record per monitoring site:

```json
{
  "siteNumber": "07227420",
  "siteName": "ARKANSAS RIVER AT HOLLY, CO.",
  "latitude": 38.0522,
  "longitude": -102.1213,
  "parameter": "Gage height, ft",
  "unit": "ft",
  "value": 12.43,
  "dateTime": "2026-08-13T19:45:00.000-06:00"
}
```

A search with no matching sites returns no items but is still billed
once for the search.

## How it works

Direct calls to the official [USGS Water Services
API](https://waterservices.usgs.gov/) (`waterservices.usgs.gov`) —
no proxy, no key, no scraping. Public U.S. government data, updated
in near real-time by USGS monitoring equipment (typically every 15–60
minutes per site).

**Note:** this actor returns the raw reading, not an official flood
classification — USGS gauge data isn't paired with NWS flood-stage
thresholds in this feed. Use `minValue` with a threshold you already
know for a site (or sort by the default highest-first order) to spot
high-water conditions.

## Pricing note

Billed per **search**, not per site returned — one charge whether the
search returns 0 sites or 200.

## Related products

- [US Weather Forecast & Alerts Tracker](https://github.com/timmKal01/us-weather-tracker) — forecasts and active NWS alerts, the atmospheric-conditions counterpart to this actor's water-level data
- [Disaster Declaration Tracker](https://github.com/timmKal01/disaster-declaration-tracker) — official FEMA disaster declarations, for after a flood is already declared
