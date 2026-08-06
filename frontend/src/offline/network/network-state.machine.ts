export type NetworkStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'RECOVERING';

export interface NetworkPolicy {
  failuresBeforeOffline: number;
  recoverySuccesses: number;
  degradationGraceMs: number;
}

export interface NetworkStateSnapshot {
  status: NetworkStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  firstFailureAt: number | null;
  lastProbeAt: number | null;
  lastSuccessAt: number | null;
  changedAt: number;
}

export const DEFAULT_NETWORK_POLICY: NetworkPolicy = {
  failuresBeforeOffline: 3,
  recoverySuccesses: 2,
  degradationGraceMs: 12_000,
};

export class NetworkStateMachine {
  public readonly state: NetworkStateSnapshot;

  public constructor(
    private readonly policy: NetworkPolicy = DEFAULT_NETWORK_POLICY,
    now = Date.now(),
  ) {
    this.state = {
      status: 'ONLINE',
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      firstFailureAt: null,
      lastProbeAt: null,
      lastSuccessAt: null,
      changedAt: now,
    };
  }

  public recordFailure(now = Date.now()): NetworkStatus {
    this.state.lastProbeAt = now;
    this.state.consecutiveFailures += 1;
    this.state.consecutiveSuccesses = 0;
    this.state.firstFailureAt ??= now;
    const graceElapsed = now - this.state.firstFailureAt >= this.policy.degradationGraceMs;
    const nextStatus = this.state.consecutiveFailures >= this.policy.failuresBeforeOffline
      && graceElapsed
      ? 'OFFLINE'
      : 'DEGRADED';
    this.setStatus(nextStatus, now);
    return this.state.status;
  }

  public recordSuccess(now = Date.now()): NetworkStatus {
    this.state.lastProbeAt = now;
    this.state.lastSuccessAt = now;
    this.state.consecutiveFailures = 0;
    this.state.firstFailureAt = null;

    if (this.state.status === 'ONLINE') {
      this.state.consecutiveSuccesses = this.policy.recoverySuccesses;
      return this.state.status;
    }

    this.state.consecutiveSuccesses += 1;
    this.setStatus(
      this.state.consecutiveSuccesses >= this.policy.recoverySuccesses
        ? 'ONLINE'
        : 'RECOVERING',
      now,
    );
    return this.state.status;
  }

  private setStatus(status: NetworkStatus, now: number): void {
    if (status === this.state.status) return;
    this.state.status = status;
    this.state.changedAt = now;
  }
}
