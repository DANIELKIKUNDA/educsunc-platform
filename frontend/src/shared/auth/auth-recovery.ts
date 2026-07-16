type AuthRecoveryHandler = () => Promise<boolean>;

let handler: AuthRecoveryHandler | null = null;

export function registerAuthRecoveryHandler(nextHandler: AuthRecoveryHandler): void {
  handler = nextHandler;
}

export async function recoverAuthentication(): Promise<boolean> {
  return handler ? handler() : false;
}
