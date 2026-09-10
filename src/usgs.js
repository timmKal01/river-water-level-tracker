const BASE_URL = 'https://waterservices.usgs.gov/nwis/iv/';

const PARAMETER_CODES = {
    gaugeHeight: '00065',
    streamflow: '00060',
};

const NO_DATA_VALUE = -999999;

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * No retry logic existed here originally, and the actor's 30-day run stats showed a 24% failure
 * rate even though USGS's API is reliable when tested manually — consistent with occasional
 * transient hiccups (full-state queries pull every active site at once) rather than a real bug.
 * Same retry-with-backoff shape already used elsewhere in this portfolio for other flaky-under-
 * load public APIs (crt.sh, Launch Library 2).
 */
async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' } });
        } catch (err) {
            lastError = err;
            if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
            continue;
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`USGS API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`USGS API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

export async function fetchReadings({ stateCode, siteNumbers, parameter, minValue, maxResults }) {
    const url = new URL(BASE_URL);
    url.searchParams.set('format', 'json');
    url.searchParams.set('parameterCd', PARAMETER_CODES[parameter] ?? PARAMETER_CODES.gaugeHeight);
    if (siteNumbers) {
        url.searchParams.set('sites', siteNumbers.replace(/\s+/g, ''));
    } else {
        url.searchParams.set('stateCd', stateCode.toUpperCase());
        url.searchParams.set('siteStatus', 'active');
    }

    const res = await fetchWithRetry(url);
    const body = await res.json();
    const series = body.value?.timeSeries ?? [];

    const readings = series
        .map((s) => {
            const latest = s.values?.[0]?.value?.[0];
            if (!latest) return null;
            const value = parseFloat(latest.value);
            if (Number.isNaN(value) || value === NO_DATA_VALUE) return null;
            return {
                siteNumber: s.sourceInfo.siteCode?.[0]?.value ?? null,
                siteName: s.sourceInfo.siteName,
                latitude: s.sourceInfo.geoLocation?.geogLocation?.latitude ?? null,
                longitude: s.sourceInfo.geoLocation?.geogLocation?.longitude ?? null,
                parameter: s.variable.variableDescription,
                unit: s.variable.unit?.unitCode ?? null,
                value,
                dateTime: latest.dateTime,
            };
        })
        .filter(Boolean)
        .filter((r) => minValue === undefined || minValue === null || r.value >= minValue)
        .sort((a, b) => b.value - a.value);

    return readings.slice(0, maxResults);
}
