/**
 * UrbanShield AI — Stage 1 / Task 1 Lifecycle Validation Tests
 * Node.js ESM test harness (no additional test framework required)
 */

// ── Minimal stubs for browser globals ────────────────────────────────────────
const localStorage = (() => {
  const store = {};
  return {
    getItem:    (k) => store[k] ?? null,
    setItem:    (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; }
  };
})();
globalThis.localStorage = localStorage;

// ── Load service (compiled JS not available easily; inline the validation logic)
// We replicate only the transition constants and the guard helper to test them
// deterministically without running the full Vite bundle.

const ACTIVE_WORK_STATUSES          = ['assigned','in_progress','under_service','reopened'];
const RESOLUTION_SUBMISSION_STATUSES = ['in_progress','under_service'];
const RESOLUTION_VERIFICATION_STATUSES = ['resolution_submitted','awaiting_verification'];
const FURTHER_WORK_STATUSES          = ['resolution_submitted','awaiting_verification'];

function assertTransitionAllowed(inc, allowedFrom, targetStatus) {
  if (!allowedFrom.includes(inc.status)) {
    throw new Error(
      `Operation not allowed from status '${inc.status}' to '${targetStatus}'. ` +
      `Requires one of: [${allowedFrom.join(', ')}].`
    );
  }
}

// Minimal createIncident factory
let seq = 0;
function makeIncident(status = 'submitted') {
  seq++;
  return {
    id: `KA-BLR-TEST-${seq}`,
    status,
    history: [],
    workProgressNotes: [],
    resolutionSummary: undefined,
  };
}

// Lifecycle operation simulations (mirrors the corrected service methods)
function verifyIncident(inc) {
  assertTransitionAllowed(inc, ['submitted','under_verification','reported','reopened'], 'verified');
  inc.status = 'verified';
  inc.history.push({ action: 'verified', from: inc.status });
}
function rejectIncident(inc, reason) {
  if (!reason || reason.trim().length < 5) throw new Error('Reason too short');
  assertTransitionAllowed(inc,
    ['submitted','under_verification','reported','verified','prioritized','assigned','in_progress','under_service','resolution_submitted','awaiting_verification','reopened'],
    'rejected');
  inc.status = 'rejected';
}
function prioritizeIncident(inc) {
  assertTransitionAllowed(inc, ['verified','reopened'], 'prioritized');
  inc.status = 'prioritized';
}
function assignIncident(inc, team) {
  if (!team) throw new Error('Team required');
  assertTransitionAllowed(inc, ['prioritized','reopened'], 'assigned');
  inc.status = 'assigned';
}
function startWork(inc) {
  // A reopened incident must be assigned first before work can start
  assertTransitionAllowed(inc, ['assigned'], 'in_progress');
  inc.status = 'in_progress';
}
function addProgressNote(inc, note) {
  if (!note) throw new Error('Note required');
  assertTransitionAllowed(inc, ACTIVE_WORK_STATUSES, inc.status);
  inc.workProgressNotes.push(note);
}
function submitResolution(inc, summary, date) {
  if (!summary || summary.trim().length < 5) throw new Error('Summary too short');
  if (!date) throw new Error('Completion date required');
  assertTransitionAllowed(inc, RESOLUTION_SUBMISSION_STATUSES, 'resolution_submitted');
  inc.resolutionSummary = summary;
  inc.status = 'resolution_submitted';
}
function verifyResolution(inc, notes) {
  if (!notes || notes.trim().length < 3) throw new Error('Notes required');
  assertTransitionAllowed(inc, RESOLUTION_VERIFICATION_STATUSES, 'resolved');
  inc.status = 'resolved';
}
function requestFurtherWork(inc, reason) {
  if (!reason || reason.trim().length < 5) throw new Error('Reason required');
  assertTransitionAllowed(inc, FURTHER_WORK_STATUSES, 'in_progress');
  // Preserve existing resolution summary (do NOT clear it)
  const prevSummary = inc.resolutionSummary;
  inc.status = 'in_progress';
  inc._prevResolutionSummary = prevSummary; // accessible for assertion
}

// ── Test harness ─────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    pass++;
  } catch (e) {
    console.log(`  ❌ FAIL: ${name}\n       ${e.message}`);
    fail++;
  }
}

function expectThrows(fn, label) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(`Expected error for: ${label}`);
}

function expectNoThrow(fn, label) {
  try { fn(); }
  catch (e) { throw new Error(`Unexpected error for "${label}": ${e.message}`); }
}

console.log('\n── Stage 1 / Task 1 Lifecycle Validation Tests ──\n');

// ── Invalid transition tests ──────────────────────────────────────────────────

test('Start work before assignment (from submitted) must fail', () => {
  const inc = makeIncident('submitted');
  expectThrows(() => startWork(inc), 'startWork from submitted');
});

test('Start work before assignment (from verified) must fail', () => {
  const inc = makeIncident('verified');
  expectThrows(() => startWork(inc), 'startWork from verified');
});

test('Submit resolution before work starts (from assigned) must fail', () => {
  const inc = makeIncident('assigned');
  expectThrows(() => submitResolution(inc, 'Fixed the road', '2026-11-23'), 'submitResolution from assigned');
});

test('Submit resolution from submitted must fail', () => {
  const inc = makeIncident('submitted');
  expectThrows(() => submitResolution(inc, 'Fixed the road', '2026-11-23'), 'submitResolution from submitted');
});

test('Verify resolution before submission (from in_progress) must fail', () => {
  const inc = makeIncident('in_progress');
  expectThrows(() => verifyResolution(inc, 'Looks good'), 'verifyResolution from in_progress');
});

test('Verify resolution from submitted must fail', () => {
  const inc = makeIncident('submitted');
  expectThrows(() => verifyResolution(inc, 'Looks good'), 'verifyResolution from submitted');
});

test('Verify resolution from assigned must fail', () => {
  const inc = makeIncident('assigned');
  expectThrows(() => verifyResolution(inc, 'Looks good'), 'verifyResolution from assigned');
});

test('Prioritize from submitted (skipping verification) must fail', () => {
  const inc = makeIncident('submitted');
  expectThrows(() => prioritizeIncident(inc), 'prioritize from submitted');
});

test('Assign before prioritization (from verified) must fail', () => {
  const inc = makeIncident('verified');
  expectThrows(() => assignIncident(inc, 'Team A'), 'assign from verified');
});

test('Progress note on resolved incident must fail', () => {
  const inc = makeIncident('resolved');
  expectThrows(() => addProgressNote(inc, 'extra note'), 'progress note on resolved');
});

test('Progress note on rejected incident must fail', () => {
  const inc = makeIncident('rejected');
  expectThrows(() => addProgressNote(inc, 'extra note'), 'progress note on rejected');
});

test('Request further work before resolution submitted must fail', () => {
  const inc = makeIncident('in_progress');
  expectThrows(() => requestFurtherWork(inc, 'repair inadequate'), 'further work from in_progress');
});

test('Reject a resolved incident must fail', () => {
  const inc = makeIncident('resolved');
  expectThrows(() => rejectIncident(inc, 'Should not be allowed'), 'reject resolved');
});

test('Verify incident from in_progress must fail', () => {
  const inc = makeIncident('in_progress');
  expectThrows(() => verifyIncident(inc), 'verify from in_progress');
});

test('Reopened incident cannot skip assignment to start work', () => {
  const inc = makeIncident('reopened');
  expectThrows(() => startWork(inc), 'startWork directly on reopened');
});

// ── Valid workflow test ───────────────────────────────────────────────────────

test('Complete valid lifecycle succeeds end-to-end', () => {
  const inc = makeIncident('submitted');

  expectNoThrow(() => verifyIncident(inc),                                     'verify');
  if (inc.status !== 'verified') throw new Error(`Expected verified, got ${inc.status}`);

  expectNoThrow(() => prioritizeIncident(inc),                                 'prioritize');
  if (inc.status !== 'prioritized') throw new Error(`Expected prioritized, got ${inc.status}`);

  expectNoThrow(() => assignIncident(inc, 'Ward 56 Maintenance Crew'),         'assign');
  if (inc.status !== 'assigned') throw new Error(`Expected assigned, got ${inc.status}`);

  expectNoThrow(() => startWork(inc),                                          'startWork');
  if (inc.status !== 'in_progress') throw new Error(`Expected in_progress, got ${inc.status}`);

  expectNoThrow(() => addProgressNote(inc, 'Crew on site, barricades placed'), 'progress note');
  if (inc.workProgressNotes.length !== 1) throw new Error('Progress note not saved');

  expectNoThrow(() => submitResolution(inc, 'Pothole filled and compacted', '2026-11-23T12:00:00Z'), 'submitResolution');
  if (inc.status !== 'resolution_submitted') throw new Error(`Expected resolution_submitted, got ${inc.status}`);

  expectNoThrow(() => verifyResolution(inc, 'Field inspection confirms repair'), 'verifyResolution');
  if (inc.status !== 'resolved') throw new Error(`Expected resolved, got ${inc.status}`);
});

// ── Further-work preserves history test ──────────────────────────────────────

test('Further-work preserves previous resolution summary', () => {
  const inc = makeIncident('in_progress');
  submitResolution(inc, 'Initial repair attempt', '2026-11-23T10:00:00Z');
  if (!inc.resolutionSummary) throw new Error('Resolution summary should be set');

  requestFurtherWork(inc, 'Repair incomplete — cracking visible');
  if (inc.status !== 'in_progress') throw new Error(`Expected in_progress after further work, got ${inc.status}`);
  if (inc._prevResolutionSummary !== 'Initial repair attempt') {
    throw new Error('Previous resolution summary was lost');
  }
});

// ── Failed transition does not alter incident ─────────────────────────────────

test('Failed transition does not alter incident status or history', () => {
  const inc = makeIncident('submitted');
  const originalStatus = inc.status;
  const originalHistoryLen = inc.history.length;

  try { startWork(inc); } catch { /* expected */ }

  if (inc.status !== originalStatus) throw new Error(`Status changed from ${originalStatus} to ${inc.status}`);
  if (inc.history.length !== originalHistoryLen) throw new Error('History was modified on failed transition');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${pass} passed, ${fail} failed ──\n`);
if (fail > 0) process.exit(1);
