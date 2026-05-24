export interface DeviceContext {
  readonly deviceId?: string;
  readonly platform?: string;
  readonly appVersion?: string;
  readonly runtimeVersion?: string;
  readonly os?: string;
  readonly networkMetadata: Record<string, string | number | boolean>;
}

