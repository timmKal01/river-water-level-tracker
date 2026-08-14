import { Actor, log } from 'apify';
import { fetchReadings } from './usgs.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { stateCode, siteNumbers, parameter = 'gaugeHeight', minValue, maxResults = 50 } = input;

if (!stateCode && !siteNumbers) {
    throw new Error('Either "stateCode" or "siteNumbers" is required.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const WATER_LEVEL_SEARCH_EVENT = 'water-level-search';

const readings = await fetchReadings({
    stateCode,
    siteNumbers,
    parameter,
    minValue,
    maxResults: Math.min(maxResults, 200),
});

for (const reading of readings) {
    await Actor.pushData(reading);
}

await Actor.charge({ eventName: WATER_LEVEL_SEARCH_EVENT });

log.info(`Pushed ${readings.length} reading(s)`);

await Actor.exit();
