# River Level Tracker: USGS Real-Time Gauges

Current river and stream levels for flood risk checks, insurance, field
operations, logistics and agriculture. Pick a state or specific USGS gauge
sites and get the latest official gauge height or streamflow from each one,
highest first, so the sites nearest high water show up at the top.

## What you get

One row per gauge site:

- Site name, number and coordinates
- The latest gauge height (feet) or streamflow (cubic feet per second), with its time
- Sorted highest reading first

## Who this is for

- **Insurance and flood risk teams** checking current river levels near insured property.
- **Field operations and construction crews** working near rivers and streams.
- **Logistics teams** watching for high water on their routes and crossings.
- **Farms and agriculture** keeping an eye on water levels for irrigation and field access.

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

- [US Weather Forecast & Alerts API (NWS)](https://apify.com/m_ctim/us-weather-tracker): forecasts and active NWS alerts, the atmospheric-conditions counterpart to this actor's water-level data
- [FEMA Disaster Declaration Tracker by State](https://apify.com/m_ctim/disaster-declaration-tracker): official FEMA disaster declarations, for after a flood is already declared
