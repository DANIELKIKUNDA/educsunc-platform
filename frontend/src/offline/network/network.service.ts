type NetworkListener = (online: boolean) => void;

class NetworkService {
  private listeners = new Set<NetworkListener>();
  private started = false;
  private onlineState = typeof navigator === 'undefined' ? true : navigator.onLine;

  private readonly handleOnline = () => this.update(true);
  private readonly handleOffline = () => this.update(false);

  public get online(): boolean {
    return this.onlineState;
  }

  public start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    this.onlineState = navigator.onLine;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  public stop(): void {
    if (!this.started || typeof window === 'undefined') return;
    this.started = false;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.onlineState);
    return () => this.listeners.delete(listener);
  }

  private update(online: boolean): void {
    if (online === this.onlineState) return;
    this.onlineState = online;
    for (const listener of this.listeners) listener(online);
  }
}

export const networkService = new NetworkService();
