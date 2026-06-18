export interface ContratsHttpRealtime {
  readonly endpointPublication: '/api/v1/realtime/events';
  readonly endpointDiffusion: '/api/v1/realtime/messages';
  readonly endpointEtat: '/api/v1/realtime/state';
}
