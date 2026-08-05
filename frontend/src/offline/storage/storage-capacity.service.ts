import { reactive, readonly } from 'vue';

export type StoragePressure = 'UNKNOWN' | 'NORMAL' | 'WARNING' | 'CRITICAL';

interface BrowserStorageManager {
  estimate(): Promise<StorageEstimate>;
  persist?(): Promise<boolean>;
  persisted?(): Promise<boolean>;
}

interface StorageCapacityState {
  supported: boolean;
  persisted: boolean;
  usageBytes: number;
  quotaBytes: number;
  pressure: StoragePressure;
  lastCheckedAt: string | null;
}

export class OfflineStorageCapacityError extends Error {
  public constructor() {
    super(
      "L'espace hors ligne de cet appareil est presque plein. Reconnectez-vous pour synchroniser les operations en attente.",
    );
    this.name = 'OfflineStorageCapacityError';
  }
}

function pressureFor(usage: number, quota: number): StoragePressure {
  if (quota <= 0) return 'UNKNOWN';
  const ratio = usage / quota;
  if (ratio >= 0.92) return 'CRITICAL';
  if (ratio >= 0.8) return 'WARNING';
  return 'NORMAL';
}

function browserStorageManager(): BrowserStorageManager | null {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  return navigator.storage;
}

export function isQuotaExceededError(error: unknown): boolean {
  return error instanceof DOMException && (
    error.name === 'QuotaExceededError'
    || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

export class StorageCapacityService {
  private readonly mutableState = reactive<StorageCapacityState>({
    supported: false,
    persisted: false,
    usageBytes: 0,
    quotaBytes: 0,
    pressure: 'UNKNOWN',
    lastCheckedAt: null,
  });

  public readonly state = readonly(this.mutableState);

  public constructor(
    private readonly managerProvider: () => BrowserStorageManager | null = browserStorageManager,
  ) {}

  public async initialize(): Promise<void> {
    const manager = this.managerProvider();
    if (!manager) return;
    this.mutableState.supported = true;
    try {
      this.mutableState.persisted = await manager.persisted?.() ?? false;
      if (!this.mutableState.persisted && manager.persist) {
        this.mutableState.persisted = await manager.persist();
      }
    } catch {
      // La persistance renforcée dépend du navigateur; l'estimation reste utilisable.
    }
    await this.refresh();
  }

  public async refresh(): Promise<void> {
    const manager = this.managerProvider();
    if (!manager) return;
    const estimate = await manager.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    this.mutableState.supported = true;
    this.mutableState.usageBytes = usage;
    this.mutableState.quotaBytes = quota;
    this.mutableState.pressure = pressureFor(usage, quota);
    this.mutableState.lastCheckedAt = new Date().toISOString();
  }

  public async assertCanStore(additionalBytes: number): Promise<void> {
    await this.refresh();
    const { quotaBytes, usageBytes, pressure } = this.mutableState;
    const safetyMargin = 1024 * 1024;
    if (
      pressure === 'CRITICAL'
      || (quotaBytes > 0 && quotaBytes - usageBytes < additionalBytes + safetyMargin)
    ) {
      throw new OfflineStorageCapacityError();
    }
  }
}

export const storageCapacityService = new StorageCapacityService();
