import { readonly, reactive } from 'vue';

interface SyncQueueState {
  pending: number;
  conflicts: number;
  rejected: number;
  synchronizing: boolean;
  lastSynchronizationAt: string | null;
}

const state = reactive<SyncQueueState>({
  pending: 0,
  conflicts: 0,
  rejected: 0,
  synchronizing: false,
  lastSynchronizationAt: null,
});

export const syncQueueStore = {
  state: readonly(state),
  update(counts: Pick<SyncQueueState, 'pending' | 'conflicts' | 'rejected'>): void {
    state.pending = counts.pending;
    state.conflicts = counts.conflicts;
    state.rejected = counts.rejected;
  },
  setSynchronizing(value: boolean): void {
    state.synchronizing = value;
  },
  markSynchronized(): void {
    state.lastSynchronizationAt = new Date().toISOString();
  },
};
