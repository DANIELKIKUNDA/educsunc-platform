// Ce controleur expose la lecture HTTP des journaux techniques SECURITY.
export class SecuriteAuditController {
  constructor(
    private readonly listerLogsFn: () => Promise<readonly unknown[]>,
    private readonly listerRefusFn: () => Promise<readonly unknown[]>,
    private readonly listerAccesFn: () => Promise<readonly unknown[]>,
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
