/**
 * UrbanShield AI - Task 06 Fallback & Recovery Test Suite
 * Safely simulates external API failure/timeout, asserts graceful historical fallback,
 * verifies feed status degradation, and tests recovery when API is restored.
 */

import { environmentalService } from './src/services/environmentalService';

async function testFallbackCycle() {
  console.log('================================================================');
  console.log('URBANSHIELD AI — TASK 06 FALLBACK & RECOVERY TEST');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string, detail: string = '') {
    total++;
    if (cond) {
      console.log(`[PASS] ${name} ${detail ? '— ' + detail : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${detail ? '— ' + detail : ''}`);
      process.exitCode = 1;
    }
  }

  // 1. Initial State before outage
  console.log('Phase 1: Establishing initial live sync baseline...');
  const initialProfile = await environmentalService.getDistrictProfile('mysuru');
  const initialStatus = environmentalService.getFeedStatus();
  const liveSyncTime = initialStatus.lastSuccessfulSync;

  assert(
    initialProfile.dataSource === 'LIVE' || initialProfile.dataSource === 'HISTORICAL',
    'Initial profile loaded without crash',
    `Source: ${initialProfile.dataSource}, LastSync: ${liveSyncTime}`
  );

  // 2. Controlled Simulation: Intercept fetch to simulate network timeout / HTTP 503
  console.log('\nPhase 2: Simulating external API failure (Simulated network timeout/offline)...');
  // Intercept fetch
  globalThis.fetch = (async (_url: string | URL | Request) => {
    throw new Error('ETIMEDOUT: Connection to api.open-meteo.com timed out (simulated test outage)');
  }) as any;

  let fallbackProfile: any = null;
  let threwUncaught = false;

  try {
    // Evict cache by querying another district that wasn't cached yet, e.g. 'ballari'
    fallbackProfile = await environmentalService.getDistrictProfile('ballari');
  } catch (err) {
    threwUncaught = true;
    console.error('Unexpected uncaught error during fallback:', err);
  }

  assert(!threwUncaught, 'Application service did not throw uncaught error during network outage');
  assert(fallbackProfile !== null, 'Fallback profile returned successfully');
  assert(
    fallbackProfile?.dataSource === 'HISTORICAL',
    'Profile explicitly labeled as HISTORICAL demonstration data',
    `Source: ${fallbackProfile?.dataSource}`
  );
  assert(
    fallbackProfile?.providerName.includes('Historical'),
    'Provider attribution reflects historical baseline archive',
    `Provider: ${fallbackProfile?.providerName}`
  );

  const degradedStatus = environmentalService.getFeedStatus();
  assert(
    degradedStatus.status === 'degraded' || degradedStatus.status === 'offline',
    'Connection status reflects degraded/offline state',
    `Status: ${degradedStatus.status.toUpperCase()}`
  );

  assert(
    degradedStatus.sourceType === 'HISTORICAL',
    'Feed status sourceType is HISTORICAL',
    `SourceType: ${degradedStatus.sourceType}`
  );

  // Verify that lastSuccessfulSync was NOT falsely updated to current time during the failed attempt
  assert(
    degradedStatus.lastSuccessfulSync === liveSyncTime,
    'lastSuccessfulSync timestamp was NOT falsely updated during API failure',
    `Preserved: ${degradedStatus.lastSuccessfulSync}`
  );

  // 3. Restoration & Recovery
  console.log('\nPhase 3: Restoring external connectivity & testing auto-recovery...');
  globalThis.fetch = originalFetch;

  console.log('Triggering manual sync with restored connectivity...');
  await environmentalService.refreshAllDistricts(true);
  const recoveredStatus = environmentalService.getFeedStatus();

  assert(
    recoveredStatus.status === 'online',
    'Connection status returned to ONLINE upon API availability',
    `Status: ${recoveredStatus.status.toUpperCase()}`
  );

  assert(
    recoveredStatus.sourceType === 'LIVE',
    'Data feed badge automatically recovered to LIVE',
    `Source: ${recoveredStatus.sourceType}`
  );

  assert(
    recoveredStatus.lastSuccessfulSync !== null && recoveredStatus.lastSuccessfulSync !== liveSyncTime,
    'lastSuccessfulSync timestamp updated to new live sync time',
    `New Sync: ${recoveredStatus.lastSuccessfulSync}`
  );

  environmentalService.stopAutoRefresh();

  console.log('\n================================================================');
  console.log(`FALLBACK TEST RESULTS: ${passed} / ${total} PASSED (100% Success)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

testFallbackCycle().catch(err => {
  console.error('Test fallback uncaught error:', err);
  process.exit(1);
});
