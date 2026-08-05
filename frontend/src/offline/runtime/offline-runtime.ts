import { watch, type WatchStopHandle } from 'vue';
import { sessionStore } from '../../shared/auth/session.store';
import { activeContextStore } from '../../shared/session/active-context.store';
import { purgeOfflineDatabase } from '../database';
import { networkService } from '../network/network.service';
import { queueService } from '../queue/queue.service';
import { syncService } from '../sync/sync.service';

interface OfflineRuntimeSnapshot {
  authenticated: boolean;
  userId: string;
  organizationId: string;
  schoolId: string;
  schoolYearId: string;
}

let stopRuntime: (() => void) | null = null;

function readSnapshot(): OfflineRuntimeSnapshot {
  return {
    authenticated: sessionStore.state.isAuthenticated,
    userId: sessionStore.state.userId,
    organizationId: activeContextStore.state.organizationId,
    schoolId: activeContextStore.state.schoolId,
    schoolYearId: activeContextStore.state.schoolYearId,
  };
}

function sameContext(left: OfflineRuntimeSnapshot, right: OfflineRuntimeSnapshot): boolean {
  return left.userId === right.userId
    && left.organizationId === right.organizationId
    && left.schoolId === right.schoolId
    && left.schoolYearId === right.schoolYearId;
}

export function initializeOfflineRuntime(): () => void {
  if (stopRuntime) return stopRuntime;

  networkService.start();
  let previous = readSnapshot();
  const unsubscribeNetwork = networkService.subscribe((online) => {
    if (online) void syncService.synchronize();
  });

  const stopWatch: WatchStopHandle = watch(
    readSnapshot,
    (current) => {
      const identityEnded = previous.authenticated
        && (!current.authenticated || current.userId !== previous.userId);
      const contextChanged = current.authenticated && !sameContext(previous, current);
      previous = current;

      if (identityEnded) {
        void purgeOfflineDatabase().finally(() => queueService.refreshCounters());
        return;
      }
      if (contextChanged) {
        void queueService.refreshCounters().then(() => syncService.synchronize());
      }
    },
    { flush: 'post' },
  );

  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && networkService.online) {
      void syncService.synchronize();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  void queueService.refreshCounters().then(() => syncService.synchronize());

  stopRuntime = () => {
    stopWatch();
    unsubscribeNetwork();
    networkService.stop();
    document.removeEventListener('visibilitychange', handleVisibility);
    stopRuntime = null;
  };
  return stopRuntime;
}
