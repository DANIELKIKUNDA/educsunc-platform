// Ce controleur expose la lecture HTTP des journaux techniques SECURITY.
export class SecuriteAuditController {
  constructor(
    private readonly listerLogsFn: () => Promise<readonly Record<string, unknown>[]>,
    private readonly listerRefusFn: () => Promise<readonly Record<string, unknown>[]>,
    private readonly listerAccesFn: () => Promise<readonly Record<string, unknown>[]>,
  ) {}

  public async listerLogs(): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerLogsFn() } };
  }

  public async listerRefus(): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerRefusFn() } };
  }

  public async listerAcces(): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerAccesFn() } };
  }
}
