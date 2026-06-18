import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ValidateurHttpCaptureTrace,
  ValidateurHttpContexteMonitoring,
  ValidateurHttpCreateAlert,
} from '../../../monitoring';
import { FIXTURE_ALERT_COMMAND, FIXTURE_MONITORING_CONTEXT, FIXTURE_TRACE_COMMAND } from '../fixtures/MonitoringFixtures';

test('les validateurs HTTP Monitoring projettent les payloads attendus', () => {
  assert.equal(
    ValidateurHttpContexteMonitoring.valider(FIXTURE_MONITORING_CONTEXT).module,
    FIXTURE_MONITORING_CONTEXT.module,
  );
  assert.equal(
    ValidateurHttpCreateAlert.valider(FIXTURE_ALERT_COMMAND).alertId,
    FIXTURE_ALERT_COMMAND.alertId,
  );
  assert.equal(
    ValidateurHttpCaptureTrace.valider(FIXTURE_TRACE_COMMAND).traceId,
    FIXTURE_TRACE_COMMAND.traceId,
  );
});
