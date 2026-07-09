import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import {
  paymentRegistrationModeOptions,
  type PaymentRegistrationModeCode,
} from '../models/payment-registration.model';
import { usePaymentRegistrationStore } from '../stores/payment-registration.store';

type UiState =
  | 'idle'
  | 'loading-student'
  | 'submitting'
  | 'missing-student'
  | 'missing-form'
  | 'technical-error';

export function usePaymentRegistrationViewModel() {
  const route = useRoute();
  const router = useRouter();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const paymentRegistrationStore = usePaymentRegistrationStore();
  const doctrineAccess = useDoctrineAccess();

  const studentIdInput = ref(lireParametreTexte(route.query.idEleve) ?? '');
  const selectedObligationId = ref('');
  const amountInput = ref('');
  const paymentMode = ref('');
  const uiState = ref<UiState>('idle');

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-01'));
  const canRecordPayment = computed(() => doctrineAccess.canUseAction('finances.payments.record', 'PF-01'));
  const profile = computed(() => paymentRegistrationStore.state.profile);
  const availableObligations = computed(() => paymentRegistrationStore.state.obligations);
  const result = computed(() => paymentRegistrationStore.state.result);
  const technicalErrorMessage = computed(() =>
    paymentRegistrationStore.state.errorMessage
    ?? 'La perception n a pas pu etre finalisee.',
  );
  const studentPaymentHistoryLink = computed(() => {
    const idEleve = profile.value?.id ?? lireParametreTexte(route.query.idEleve);
    return idEleve ? `/app/finances/historiques/${idEleve}` : '/app/finances/historiques';
  });
  const studentFinancialSituationLink = computed(() => {
    const idEleve = profile.value?.id ?? lireParametreTexte(route.query.idEleve);
    return idEleve ? `/app/finances/dettes/${idEleve}` : '/app/finances/dettes';
  });
  const selectedObligation = computed(() =>
    availableObligations.value.find((obligation) => obligation.id === selectedObligationId.value),
  );
  const selectedModeLabel = computed(() =>
    paymentRegistrationModeOptions.find((mode) => mode.value === paymentMode.value)?.label ?? '-',
  );
  const perimeterMessage = computed(() => {
    switch (session.actorCode) {
      case 'PREFET_ETUDES':
        return 'Perimetre visible: section secondaire uniquement, selon delegation locale sur le type de frais.';
      case 'DIRECTEUR_PRIMAIRE':
        return 'Perimetre visible: section primaire uniquement, selon delegation locale sur le type de frais.';
      case 'DIRECTEUR_MATERNELLE':
        return 'Perimetre visible: section maternelle uniquement, selon delegation locale sur le type de frais.';
      case 'ADMINISTRATEUR_ECOLE':
        return 'Perimetre visible: ecole active uniquement. Le frontend ne donne pas un statut de caissier universel.';
      default:
        return 'Perimetre visible: meme ecole, avec priorite au percepteur reel de caisse.';
    }
  });

  function lireParametreTexte(valeur: unknown): string | undefined {
    return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
  }

  async function verifyStudent(): Promise<void> {
    if (studentIdInput.value.trim().length === 0) {
      uiState.value = 'missing-student';
      return;
    }

    uiState.value = 'loading-student';
    selectedObligationId.value = '';
    amountInput.value = '';
    paymentMode.value = '';

    await paymentRegistrationStore.chargerEleve({
      idEleve: studentIdInput.value.trim(),
      classe: lireParametreTexte(route.query.classe),
      section: lireParametreTexte(route.query.section),
      anneeScolaire: lireParametreTexte(route.query.anneeScolaire),
    });

    uiState.value = paymentRegistrationStore.state.status === 'error'
      ? 'technical-error'
      : 'idle';
  }

  async function verifyStudentFromRoute(): Promise<void> {
    const routeStudentId = lireParametreTexte(route.query.idEleve);
    if (!routeStudentId) return;
    studentIdInput.value = routeStudentId;
    await verifyStudent();
  }

  function pickObligation(obligationId: string): void {
    selectedObligationId.value = obligationId;
    const obligation = availableObligations.value.find((item) => item.id === obligationId);
    amountInput.value = obligation !== undefined ? String(obligation.montantExigible) : '';
    uiState.value = 'idle';
  }

  async function submitPayment(): Promise<void> {
    if (profile.value === null) {
      uiState.value = 'missing-student';
      return;
    }

    if (
      selectedObligation.value === undefined
      || paymentMode.value.length === 0
      || amountInput.value.length === 0
    ) {
      uiState.value = 'missing-form';
      return;
    }

    uiState.value = 'submitting';

    await paymentRegistrationStore.soumettrePaiement({
      idEleve: profile.value.id,
      typeFraisDeclare: selectedObligation.value.typeFrais,
      montant: amountInput.value,
      modePaiement: paymentMode.value as PaymentRegistrationModeCode,
    });

    uiState.value = paymentRegistrationStore.state.status === 'error'
      ? 'technical-error'
      : 'idle';
  }

  function resetOperation(): void {
    selectedObligationId.value = '';
    amountInput.value = '';
    paymentMode.value = '';
    uiState.value = 'idle';
    paymentRegistrationStore.reinitialiser();
  }

  async function ouvrirHistoriquePaiements(): Promise<void> {
    if (!profile.value) return;
    await router.push(`/app/finances/historiques/${profile.value.id}`);
  }

  async function ouvrirSituationFinanciere(): Promise<void> {
    if (!profile.value) return;
    await router.push(`/app/finances/dettes/${profile.value.id}`);
  }

  async function ouvrirDernierRecu(): Promise<void> {
    const latestReceipt = result.value?.receipts[0];
    if (!latestReceipt) return;
    await router.push(`/app/finances/recus/${latestReceipt.id}`);
  }

  function formatCurrency(amount: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} FC`;
  }

  watch(
    () => route.fullPath,
    async () => {
      paymentRegistrationStore.reinitialiser();
      selectedObligationId.value = '';
      amountInput.value = '';
      paymentMode.value = '';
      uiState.value = 'idle';
      studentIdInput.value = lireParametreTexte(route.query.idEleve) ?? '';

      if (studentIdInput.value) {
        await verifyStudentFromRoute();
      }
    },
    { immediate: true },
  );

  return {
    route,
    router,
    session,
    context,
    paymentRegistrationStore,
    studentIdInput,
    selectedObligationId,
    amountInput,
    paymentMode,
    uiState,
    isAuthorized,
    canRecordPayment,
    profile,
    availableObligations,
    result,
    technicalErrorMessage,
    studentPaymentHistoryLink,
    studentFinancialSituationLink,
    selectedObligation,
    selectedModeLabel,
    perimeterMessage,
    paymentRegistrationModeOptions,
    verifyStudent,
    verifyStudentFromRoute,
    pickObligation,
    submitPayment,
    resetOperation,
    ouvrirHistoriquePaiements,
    ouvrirSituationFinanciere,
    ouvrirDernierRecu,
    formatCurrency,
  };
}
