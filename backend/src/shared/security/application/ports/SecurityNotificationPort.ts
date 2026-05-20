export interface SecurityNotificationPort {
  notifierAccesSensible(params: {
    idUtilisateur: string;
    action: string;
    details?: Record<string, unknown>;
  }): Promise<void>;
}
