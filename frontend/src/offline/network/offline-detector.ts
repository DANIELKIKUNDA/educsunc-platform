import { networkService } from './network.service';

export const offlineDetector = {
  start(): void {
    networkService.start();
  },
  stop(): void {
    networkService.stop();
  },
  get isOffline(): boolean {
    return !networkService.online;
  },
};
