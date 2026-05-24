export const AUDIT_TEST_TENANTS = {
  organisationA: 'org-a',
  organisationB: 'org-b',
  ecoleA: 'ecole-a',
  ecoleB: 'ecole-b',
} as const;

export const AUDIT_TEST_TRACES = {
  correlationId: 'corr-audit-tests',
  requestId: 'req-audit-tests',
  traceId: 'trace-audit-tests',
  spanId: 'span-audit-tests',
} as const;
