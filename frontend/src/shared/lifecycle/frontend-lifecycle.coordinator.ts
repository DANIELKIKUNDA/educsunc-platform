export type FrontendLifecycleChange =
  | 'identity'
  | 'actor'
  | 'permissions'
  | 'governance-level'
  | 'organization'
  | 'school'
  | 'school-year';

export type FrontendStoreScope =
  | 'platform'
  | 'organization'
  | 'school'
  | 'school-year'
  | 'user'
  | 'context';

export interface FrontendLifecycleSnapshot {
  readonly authenticated: boolean;
  readonly sessionId: string;
  readonly userId: string;
  readonly actorCode: string;
  readonly permissionsSignature: string;
  readonly governanceLevel: string;
  readonly organizationId: string;
  readonly schoolId: string;
  readonly schoolYearId: string;
}

export interface FrontendStoreInvalidation {
  readonly id: string;
  readonly scope: FrontendStoreScope;
  readonly reset: () => void;
}

export interface FrontendRequestScope {
  readonly revision: number;
  readonly signal: AbortSignal;
  isCurrent(): boolean;
  release(): void;
}

function detectChange(
  previous: FrontendLifecycleSnapshot,
  next: FrontendLifecycleSnapshot,
): FrontendLifecycleChange | null {
  if (
    previous.authenticated !== next.authenticated
    || previous.sessionId !== next.sessionId
    || previous.userId !== next.userId
  ) {
    return 'identity';
  }
  if (previous.actorCode !== next.actorCode) {
    return 'actor';
  }
  if (previous.permissionsSignature !== next.permissionsSignature) {
    return 'permissions';
  }
  if (previous.governanceLevel !== next.governanceLevel) {
    return 'governance-level';
  }
  if (previous.organizationId !== next.organizationId) {
    return 'organization';
  }
  if (previous.schoolId !== next.schoolId) {
    return 'school';
  }
  if (previous.schoolYearId !== next.schoolYearId) {
    return 'school-year';
  }
  return null;
}

function shouldInvalidate(scope: FrontendStoreScope, change: FrontendLifecycleChange): boolean {
  if (
    change === 'identity'
    || change === 'actor'
    || change === 'permissions'
    || change === 'governance-level'
  ) {
    return true;
  }
  if (scope === 'context') {
    return true;
  }
  if (change === 'organization') {
    return scope === 'organization' || scope === 'school' || scope === 'school-year';
  }
  if (change === 'school') {
    return scope === 'school' || scope === 'school-year';
  }
  return scope === 'school-year';
}

export class FrontendLifecycleCoordinator {
  private revisionValue = 0;
  private contextController = new AbortController();
  private readonly invalidations = new Map<string, FrontendStoreInvalidation>();

  public constructor(private snapshot: FrontendLifecycleSnapshot) {}

  public get revision(): number {
    return this.revisionValue;
  }

  public update(next: FrontendLifecycleSnapshot): FrontendLifecycleChange | null {
    const change = detectChange(this.snapshot, next);
    this.snapshot = next;
    if (change === null) {
      return null;
    }

    this.contextController.abort();
    this.contextController = new AbortController();
    this.revisionValue += 1;

    for (const invalidation of this.invalidations.values()) {
      if (shouldInvalidate(invalidation.scope, change)) {
        invalidation.reset();
      }
    }
    return change;
  }

  public registerStore(invalidation: FrontendStoreInvalidation): () => void {
    this.invalidations.set(invalidation.id, invalidation);
    return () => {
      if (this.invalidations.get(invalidation.id) === invalidation) {
        this.invalidations.delete(invalidation.id);
      }
    };
  }

  public createRequestScope(externalSignal?: AbortSignal): FrontendRequestScope {
    const revision = this.revisionValue;
    const lifecycleSignal = this.contextController.signal;
    const requestController = new AbortController();
    const abortRequest = () => requestController.abort();

    lifecycleSignal.addEventListener('abort', abortRequest, { once: true });
    externalSignal?.addEventListener('abort', abortRequest, { once: true });
    if (lifecycleSignal.aborted || externalSignal?.aborted) {
      requestController.abort();
    }

    let released = false;
    return {
      revision,
      signal: requestController.signal,
      isCurrent: () =>
        revision === this.revisionValue
        && !requestController.signal.aborted,
      release: () => {
        if (released) return;
        released = true;
        lifecycleSignal.removeEventListener('abort', abortRequest);
        externalSignal?.removeEventListener('abort', abortRequest);
      },
    };
  }
}
