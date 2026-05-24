export type AuditTransactionMode =
  | 'APPEND_ONLY_COURTE'
  | 'LECTURE_ARCHIVE'
  | 'REBUILD_PROJECTIONS'
  | 'PREPARATION_COLD_STORAGE';

// Ce contexte garde la discipline transactionnelle recommandee par le document.
export interface AuditTransactionContext {
  readonly mode: AuditTransactionMode;
  readonly description: string;
  readonly appendOnly: boolean;
  readonly publierAsynchroneApresCommit: boolean;
}

export const AUDIT_TRANSACTION_CONTEXTS = {
  APPEND_ONLY_COURTE: {
    mode: 'APPEND_ONLY_COURTE',
    description: "Insert append-only rapide avec commit court, puis traitements async apres commit.",
    appendOnly: true,
    publierAsynchroneApresCommit: true,
  },
  LECTURE_ARCHIVE: {
    mode: 'LECTURE_ARCHIVE',
    description: 'Lecture archive ou forensic sans allonger une transaction metier principale.',
    appendOnly: true,
    publierAsynchroneApresCommit: false,
  },
  REBUILD_PROJECTIONS: {
    mode: 'REBUILD_PROJECTIONS',
    description: 'Reconstruction technique de projections depuis la source append-only.',
    appendOnly: true,
    publierAsynchroneApresCommit: false,
  },
  PREPARATION_COLD_STORAGE: {
    mode: 'PREPARATION_COLD_STORAGE',
    description: 'Preparation de packages froids sans relecture brutale en transaction geante.',
    appendOnly: true,
    publierAsynchroneApresCommit: false,
  },
} as const satisfies Record<AuditTransactionMode, AuditTransactionContext>;

