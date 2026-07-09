import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useEnrollmentStore } from '../stores/enrollment.store';

export function useCompleteEnrollmentViewModel() {
  const store = useEnrollmentStore();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const doctrineAccess = useDoctrineAccess();
  const route = useRoute();
  const router = useRouter();
  const isAuthorized = computed(() => doctrineAccess.canAccessPage('SCO-001'));
  const canWriteEnrollment = computed(() => doctrineAccess.canUseAction('scolarite.inscription.write', 'SCO-001'));
  const hasAffectation = ref(true);

  const eleve = reactive({
    idEleve: '',
    matricule: '',
    nom: '',
    postNom: '',
    prenom: '',
    sexe: 'F' as 'F' | 'M',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: '',
    typeProvenance: 'EXTERNE' as 'INTERNE' | 'EXTERNE',
    nomEcoleProvenance: '',
    idFamille: '',
  });

  const inscription = reactive({
    idInscriptionScolaire: '',
    idAnneeScolaire: '',
    dateInscription: '',
    origineInscription: 'NOUVEAU' as 'NOUVEAU' | 'ANCIEN' | 'TRANSFERE_ENTRANT' | 'REINTEGRE',
    numeroOrdre: '',
    observation: '',
  });

  const affectation = reactive({
    idAffectationClasse: '',
    idClassePedagogique: '',
    dateAffectation: '',
    motifAffectation: '',
  });

  const perimeterMessage = computed(() =>
    `Flux borne a l ecole active ${context.schoolName} et a l annee ${context.schoolYearLabel}. Aucun autre acteur ne doit ouvrir ce parcours complet.`,
  );

  const isEleveStepComplete = computed(() =>
    eleve.idEleve.trim().length > 0
    && eleve.matricule.trim().length > 0
    && eleve.nom.trim().length > 0
    && eleve.postNom.trim().length > 0
    && eleve.dateNaissance.trim().length > 0
    && eleve.nomEcoleProvenance.trim().length > 0,
  );

  const isFamilleStepComplete = computed(() => eleve.idFamille.trim().length > 0);

  const isInscriptionStepComplete = computed(() =>
    inscription.idInscriptionScolaire.trim().length > 0
    && context.schoolYearId.trim().length > 0
    && inscription.dateInscription.trim().length > 0,
  );

  const isAffectationStepComplete = computed(() => {
    if (!hasAffectation.value) {
      return true;
    }

    return (
      affectation.idAffectationClasse.trim().length > 0
      && affectation.idClassePedagogique.trim().length > 0
      && affectation.dateAffectation.trim().length > 0
    );
  });

  const completedSteps = computed(() =>
    Number(isEleveStepComplete.value)
    + Number(isFamilleStepComplete.value)
    + Number(isInscriptionStepComplete.value)
    + Number(isAffectationStepComplete.value),
  );

  const completedStepsLabel = computed(() => {
    if (completedSteps.value === 4) {
      return 'Flux pret pour soumission';
    }

    return `${4 - completedSteps.value} etape(s) a completer`;
  });

  const canSubmit = computed(() =>
    isEleveStepComplete.value
    && isInscriptionStepComplete.value
    && isAffectationStepComplete.value,
  );

  async function soumettre(): Promise<void> {
    await store.soumettre({
      eleve: {
        ...eleve,
        prenom: eleve.prenom || undefined,
        lieuNaissance: eleve.lieuNaissance || undefined,
        nationalite: eleve.nationalite || undefined,
        idFamille: eleve.idFamille || undefined,
      },
      inscription: {
        ...inscription,
        idEleve: eleve.idEleve,
        idAnneeScolaire: context.schoolYearId,
        numeroOrdre: inscription.numeroOrdre || undefined,
        observation: inscription.observation || undefined,
      },
      affectation: hasAffectation.value
        ? {
          ...affectation,
          idInscriptionScolaire: inscription.idInscriptionScolaire,
          motifAffectation: affectation.motifAffectation || undefined,
        }
        : undefined,
    });
  }

  async function ouvrirFamilles(): Promise<void> {
    await router.push('/app/scolarite/familles');
  }

  async function ouvrirEleves(): Promise<void> {
    const idEleve = store.state.result?.idEleve || eleve.idEleve;
    await router.push(idEleve ? `/app/scolarite/eleves?idEleve=${idEleve}` : '/app/scolarite/eleves');
  }

  async function ouvrirAffectations(): Promise<void> {
    const query = new URLSearchParams();
    const idInscription = store.state.result?.idInscriptionScolaire || inscription.idInscriptionScolaire;
    const idClasse = affectation.idClassePedagogique;

    if (idInscription) {
      query.set('idInscriptionScolaire', idInscription);
    }

    if (idClasse) {
      query.set('idClassePedagogique', idClasse);
    }

    const suffix = query.toString();
    await router.push(suffix ? `/app/scolarite/affectations?${suffix}` : '/app/scolarite/affectations');
  }

  async function ouvrirPaiement(): Promise<void> {
    const idEleve = store.state.result?.idEleve || eleve.idEleve;
    await router.push(idEleve ? `/app/finances/paiements/enregistrer?idEleve=${idEleve}` : '/app/finances/paiements/enregistrer');
  }

  function prefillDemo(): void {
    eleve.idEleve = 'eleve-demo-001';
    eleve.matricule = 'EL-2026-001';
    eleve.nom = 'Mbuyi';
    eleve.postNom = 'Kalala';
    eleve.prenom = 'Sarah';
    eleve.dateNaissance = '2012-04-19';
    eleve.lieuNaissance = 'Lubumbashi';
    eleve.nationalite = 'Congolaise';
    eleve.nomEcoleProvenance = 'Institut Source';
    eleve.idFamille = 'famille-demo-001';
    inscription.idInscriptionScolaire = 'inscription-demo-001';
    inscription.dateInscription = '2026-09-01';
    affectation.idAffectationClasse = 'affectation-demo-001';
    affectation.idClassePedagogique = 'classe-demo-001';
    affectation.dateAffectation = '2026-09-02';
  }

  function reinitialiserFormulaire(): void {
    eleve.idEleve = '';
    eleve.matricule = '';
    eleve.nom = '';
    eleve.postNom = '';
    eleve.prenom = '';
    eleve.sexe = 'F';
    eleve.dateNaissance = '';
    eleve.lieuNaissance = '';
    eleve.nationalite = '';
    eleve.typeProvenance = 'EXTERNE';
    eleve.nomEcoleProvenance = '';
    eleve.idFamille = '';
    inscription.idInscriptionScolaire = '';
    inscription.dateInscription = '';
    inscription.origineInscription = 'NOUVEAU';
    inscription.numeroOrdre = '';
    inscription.observation = '';
    affectation.idAffectationClasse = '';
    affectation.idClassePedagogique = '';
    affectation.dateAffectation = '';
    affectation.motifAffectation = '';
    hasAffectation.value = true;
    store.reinitialiser();
  }

  onMounted(() => {
    const idFamille = typeof route.query.idFamille === 'string' ? route.query.idFamille : '';
    const idEleve = typeof route.query.idEleve === 'string' ? route.query.idEleve : '';
    const idInscription = typeof route.query.idInscriptionScolaire === 'string' ? route.query.idInscriptionScolaire : '';
    const idClasse = typeof route.query.idClassePedagogique === 'string' ? route.query.idClassePedagogique : '';

    if (idFamille) {
      eleve.idFamille = idFamille;
    }
    if (idEleve) {
      eleve.idEleve = idEleve;
    }
    if (idInscription) {
      inscription.idInscriptionScolaire = idInscription;
    }
    if (idClasse) {
      affectation.idClassePedagogique = idClasse;
    }
  });

  return {
    store,
    session,
    context,
    doctrineAccess,
    route,
    router,
    isAuthorized,
    canWriteEnrollment,
    hasAffectation,
    eleve,
    inscription,
    affectation,
    perimeterMessage,
    isEleveStepComplete,
    isFamilleStepComplete,
    isInscriptionStepComplete,
    isAffectationStepComplete,
    completedSteps,
    completedStepsLabel,
    canSubmit,
    soumettre,
    ouvrirFamilles,
    ouvrirEleves,
    ouvrirAffectations,
    ouvrirPaiement,
    prefillDemo,
    reinitialiserFormulaire,
  };
}
