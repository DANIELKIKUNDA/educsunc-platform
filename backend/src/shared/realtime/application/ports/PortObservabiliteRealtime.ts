export interface PortObservabiliteRealtime {
  enregistrerSignal(signal: {
    readonly type: string;
    readonly canal: string;
    readonly audience: number;
  }): Promise<void>;
}
