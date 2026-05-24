export interface DeviceContext {
  readonly deviceId?: string;
  readonly appVersion?: string;
  readonly plateforme?: string;
  readonly modeOffline: boolean;
  readonly syncId?: string;
}

