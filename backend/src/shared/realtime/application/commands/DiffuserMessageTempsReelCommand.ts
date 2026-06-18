export interface DiffuserMessageTempsReelCommand {
  readonly messageId: string;
  readonly type: string;
  readonly canal: string;
  readonly destinataires: readonly string[];
  readonly payload: Readonly<Record<string, unknown>>;
}
