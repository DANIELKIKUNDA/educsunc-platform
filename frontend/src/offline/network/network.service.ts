import { readonly, reactive } from 'vue';
import { ApiError, clientApi } from '../../shared/http/api.client';
import {
  NetworkStateMachine,
  type NetworkStateSnapshot,
  type NetworkStatus,
} from './network-state.machine';

type NetworkListener = (online: boolean) => void;
type ConnectivityProbe = () => Promise<boolean | null>;

const PROBE_DELAYS: Record<NetworkStatus, number> = {
  ONLINE: 30_000,
  DEGRADED: 4_000,
  OFFLINE: 12_000,
  RECOVERING: 3_000,
};

async function defaultConnectivityProbe(): Promise<boolean | null> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 5_000);
  try {
    await clientApi.envoyer({
      chemin: '/health/live',
      authRecovery: false,
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch (error) {
    if (timedOut) return false;
    if (error instanceof ApiError && error.code === 'REQUEST_CANCELLED') return null;
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export class NetworkService {
  private readonly machine: NetworkStateMachine;
  private readonly mutableState: NetworkStateSnapshot;
  private readonly listeners = new Set<NetworkListener>();
  private started = false;
  private timer: number | null = null;
  private probeInFlight: Promise<void> | null = null;

  private readonly handleOnline = () => {
    this.scheduleProbe(0);
  };

  private readonly handleOffline = () => {
    this.reportTransportFailure();
  };

  public readonly state;

  public constructor(
    private readonly probe: ConnectivityProbe = defaultConnectivityProbe,
    machine = new NetworkStateMachine(),
  ) {
    this.machine = machine;
    // La machine reste indépendante de Vue; une copie réactive reçoit chaque transition.
    this.mutableState = reactive({ ...machine.state }) as NetworkStateSnapshot;
    this.state = readonly(this.mutableState);
  }

  public get online(): boolean {
    return this.mutableState.status === 'ONLINE';
  }

  public get status(): NetworkStatus {
    return this.mutableState.status;
  }

  public start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    if (!navigator.onLine) this.reportTransportFailure();
    this.scheduleProbe(0);
  }

  public stop(): void {
    if (!this.started || typeof window === 'undefined') return;
    this.started = false;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.online);
    return () => this.listeners.delete(listener);
  }

  public reportTransportFailure(): void {
    const wasOnline = this.online;
    this.machine.recordFailure();
    this.synchronizeState();
    this.notifyIfChanged(wasOnline);
    this.scheduleProbe(PROBE_DELAYS[this.status]);
  }

  public probeNow(): Promise<void> {
    if (this.probeInFlight) return this.probeInFlight;
    this.probeInFlight = this.executeProbe().finally(() => {
      this.probeInFlight = null;
    });
    return this.probeInFlight;
  }

  private async executeProbe(): Promise<void> {
    const result = await this.probe();
    if (result === null) {
      this.scheduleProbe(PROBE_DELAYS[this.status]);
      return;
    }

    const wasOnline = this.online;
    if (result) this.machine.recordSuccess();
    else this.machine.recordFailure();
    this.synchronizeState();
    this.notifyIfChanged(wasOnline);
    this.scheduleProbe(PROBE_DELAYS[this.status]);
  }

  private notifyIfChanged(wasOnline: boolean): void {
    if (wasOnline === this.online) return;
    for (const listener of this.listeners) listener(this.online);
  }

  private synchronizeState(): void {
    Object.assign(this.mutableState, this.machine.state);
  }

  private scheduleProbe(delay: number): void {
    if (!this.started || typeof window === 'undefined') return;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.timer = null;
      void this.probeNow();
    }, delay);
  }
}

export const networkService = new NetworkService();
