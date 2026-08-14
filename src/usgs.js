const BASE_URL = 'https://waterservices.usgs.gov/nwis/iv/';

const PARAMETER_CODES = {
    gaugeHeight: '00065',
    streamflow: '00060',
};

const NO_DATA_VALUE = -999999;

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

    const res = await fetch(url, { headers: { Connection: 'close' } });
    if (!res.ok) {
        throw new Error(`USGS API request failed: ${res.status} ${res.statusText}`);
    }
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
