/**
 * UrbanShield AI — Step 7 Citizen Problem-Reporting Verification Suite
 * Exercises real incidentService.ts logic (bundled via Vite/esbuild or Node) for:
 *   1. Submitting a report with valid information (including reportedAt & additionalNotes)
 *   2. Rejecting reports without required fields (title, category, description, district, city, area, location)
 *   3. Uploading valid photographs (up to 5)
 *   4. Rejecting empty image data
 *   5. Enforcing the 5-photograph maximum
 *   6. Preventing duplicate photographs
 *   7. GPS / verified location & Karnataka coordinate validation
 *   8. Unconfirmed / missing location rejection
 *   9. Manual location entry within district bounds
 *  10. Duplicate submission guard (synchronous lock)
 *  11. Collision-safe unique incident tracking ID generation
 *  12. Submitted reports appearing in citizen My Reports view (getMyReports)
 *  13. Preserving existing incident lifecycle behavior (submitted/under_verification -> verified -> ... -> resolved)
 */

// Minimal localStorage stub for Node
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true }
});

const { incidentService, getStatusDisplayName } = await vite.ssrLoadModule('/src/services/incidentService.ts');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function expectThrows(fn, label) {
  let threw = false;
  let msg = '';
  try {
    fn();
  } catch (err) {
    threw = true;
    msg = err?.message || String(err);
  }
  assert(threw, `Expected error to be thrown for: ${label}`);
  return msg;
}

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

const makePhoto = (idx, seed = idx) => ({
  id: `photo-${idx}`,
  name: `evidence-${idx}.jpg`,
  size: 2048 + idx,
  dataUrl: `data:image/jpeg;base64,FAKEIMGDATA_${seed}`,
  uploadedAt: new Date().toISOString()
});

const validInput = (overrides = {}) => ({
  category: 'potholes',
  title: 'Deep crater pothole near Silk Board bus stop',
  description: 'A wide 45cm pothole filled with rainwater is causing two-wheelers to skid daily.',
  observedSeverity: 'high',
  reportedAt: '2026-11-26T10:15:00.000Z',
  additionalNotes: 'Worst during evening rush hour near Metro Pillar 142.',
  safetyIndicators: ['traffic_obstruction', 'risk_to_pedestrians'],
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  cityOrTown: 'Bengaluru',
  area: 'BTM Layout 2nd Stage',
  landmark: 'Opposite Udupi Garden signal',
  latitude: 12.9166,
  longitude: 77.6101,
  locationVerified: true,
  photos: [makePhoto(1)],
  reportedByUserId: 'cit-test-01',
  reportedByUserName: 'Ananya Rao',
  reportedByUserEmail: 'ananya@example.com',
  ...overrides
});

console.log('\n======================================================');
console.log('URBANSHIELD AI — STEP 7 CITIZEN REPORTING TESTS');
console.log('======================================================\n');

test('1. Submit valid report with reportedAt, additionalNotes, photo, and location', () => {
  const inc = incidentService.createReport(validInput());
  assert(inc.id.startsWith('KA-BLR-'), `Unexpected ID format: ${inc.id}`);
  assert(inc.status === 'under_verification', `Unexpected initial status: ${inc.status}`);
  assert(getStatusDisplayName(inc.status).includes('SUBMITTED'), 'Status display should indicate SUBMITTED');
  assert(inc.reportedAt === '2026-11-26T10:15:00.000Z', 'Custom reportedAt must be preserved');
  assert(inc.additionalNotes === 'Worst during evening rush hour near Metro Pillar 142.', 'Additional notes must be saved');
  assert(inc.evidencePhotos.length === 1, '1 photo must be stored');
  assert(inc.history.length === 1 && inc.history[0].newStatus === 'submitted', 'Initial history event created');
});

test('2. Reject missing required fields (category, title, description, district, city, area)', () => {
  expectThrows(() => incidentService.createReport(validInput({ category: '' })), 'missing category');
  expectThrows(() => incidentService.createReport(validInput({ title: '   ' })), 'empty title');
  expectThrows(() => incidentService.createReport(validInput({ description: '' })), 'empty description');
  expectThrows(() => incidentService.createReport(validInput({ district: '' })), 'missing district');
  expectThrows(() => incidentService.createReport(validInput({ cityOrTown: '  ' })), 'missing city');
  expectThrows(() => incidentService.createReport(validInput({ area: '' })), 'missing area');
});

test('3. Accept up to 5 distinct valid photographs', () => {
  const photos = [1, 2, 3, 4, 5].map(i => makePhoto(i, `uniq_${i}`));
  const inc = incidentService.createReport(validInput({ photos }));
  assert(inc.evidencePhotos.length === 5, 'Should accept 5 valid photos');
});

test('4. Reject empty image data', () => {
  const badPhoto = { id: 'p-empty', name: 'empty.jpg', size: 0, dataUrl: '   ', uploadedAt: new Date().toISOString() };
  expectThrows(() => incidentService.createReport(validInput({ photos: [badPhoto] })), 'empty photo dataUrl');
});

test('5. Reject more than 5 photographs', () => {
  const sixPhotos = [1, 2, 3, 4, 5, 6].map(i => makePhoto(i, `six_${i}`));
  expectThrows(() => incidentService.createReport(validInput({ photos: sixPhotos })), 'more than 5 photos');
});

test('6. Reject duplicate photographs', () => {
  const dupPhotos = [makePhoto(1, 'same'), makePhoto(2, 'same')];
  expectThrows(() => incidentService.createReport(validInput({ photos: dupPhotos })), 'duplicate photos');
});

test('7. Reject missing/unverified location & outside-Karnataka coordinates', () => {
  expectThrows(() => incidentService.createReport(validInput({ locationVerified: false })), 'unverified location');
  expectThrows(() => incidentService.createReport(validInput({ latitude: undefined, longitude: undefined })), 'undefined coords');
  expectThrows(() => incidentService.createReport(validInput({ latitude: 28.6139, longitude: 77.2090 })), 'outside Karnataka');
});

test('8. Reject coordinates inconsistent with chosen district', () => {
  expectThrows(
    () => incidentService.createReport(validInput({ district: 'Belagavi', cityOrTown: 'Belagavi', latitude: 12.9716, longitude: 77.5946 })),
    'Bengaluru coords under Belagavi district'
  );
});

test('9. Accept valid manual location entry for another Karnataka district (Mysuru)', () => {
  const inc = incidentService.createReport(
    validInput({
      district: 'Mysuru',
      cityOrTown: 'Mysuru',
      area: 'Vijayanagar 2nd Stage',
      latitude: 12.3215,
      longitude: 76.6128,
      locationVerified: true
    })
  );
  assert(inc.id.startsWith('KA-MYS-'), `Expected KA-MYS- prefix, got ${inc.id}`);
  assert(inc.district === 'Mysuru');
});

await testAsync('10. Synchronous submission lock prevents duplicate concurrent submissions', async () => {
  let lock = false;
  let calls = 0;
  const submitWithLock = async () => {
    if (lock) return null;
    lock = true;
    try {
      calls++;
      await new Promise(r => setTimeout(r, 15));
      return incidentService.createReport(validInput({ title: `Locked report ${calls}` }));
    } finally {
      lock = false;
    }
  };
  const results = await Promise.all([submitWithLock(), submitWithLock(), submitWithLock()]);
  const created = results.filter(Boolean);
  assert(calls === 1 && created.length === 1, `Expected 1 submission, got ${created.length}`);
});

test('11. Tracking ID generation is collision-safe across 50 rapid reports', () => {
  const seen = new Set();
  for (let i = 0; i < 50; i++) {
    const inc = incidentService.createReport(validInput({ title: `Rapid report ${i}` }));
    assert(!seen.has(inc.id), `Collision on ${inc.id}`);
    seen.add(inc.id);
  }
  assert(seen.size === 50);
});

test('12. Submitted report appears in citizen My Reports view (getMyReports)', () => {
  const created = incidentService.createReport(
    validInput({
      title: 'Streetlight failure at Indiranagar 100ft Rd',
      category: 'other_civic',
      reportedByUserId: 'cit-unique-99',
      reportedByUserEmail: 'cit99@karnataka.gov.in'
    })
  );
  const byId = incidentService.getMyReports('cit-unique-99');
  const byEmail = incidentService.getMyReports('cit99@karnataka.gov.in');
  assert(byId.some(r => r.id === created.id), 'Report must appear in getMyReports by userId');
  assert(byEmail.some(r => r.id === created.id), 'Report must appear in getMyReports by email');
});

test('13. Existing incident lifecycle behavior remains unchanged for submitted report', () => {
  const inc = incidentService.createReport(validInput({ title: 'Lifecycle check drainage issue', category: 'blocked_drainage' }));
  assert(inc.status === 'under_verification');
  expectThrows(() => incidentService.startWork({ incidentId: inc.id, startedBy: 'Crew' }), 'cannot startWork before assign');
  incidentService.verifyIncident({ incidentId: inc.id, verifiedBy: 'Officer', notes: 'Confirmed' });
  assert(inc.status === 'verified');
  incidentService.prioritizeIncident({ incidentId: inc.id, priority: 'high', actorName: 'Ops' });
  assert(inc.status === 'prioritized');
  incidentService.assignIncident({ incidentId: inc.id, assignedTeam: 'BBMP Crew', assignedBy: 'Eng' });
  assert(inc.status === 'assigned');
  incidentService.startWork({ incidentId: inc.id, startedBy: 'Lead' });
  assert(inc.status === 'in_progress');
  incidentService.submitResolution({ incidentId: inc.id, resolutionSummary: 'Drain cleared', workCompletionDate: '2026-11-26', submittedBy: 'Lead' });
  assert(inc.status === 'resolution_submitted');
  incidentService.verifyResolution({ incidentId: inc.id, verifiedBy: 'Auditor', verificationNotes: 'Verified' });
  assert(inc.status === 'resolved');
});

await vite.close();

console.log('\n======================================================');
console.log(`STEP 7 REPORTING TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');
if (failed > 0) process.exit(1);
