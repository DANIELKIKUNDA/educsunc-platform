import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  construireNomComplet,
  type EleveItem,
  type ResponsableFamilleItem,
} from '../models/scolarite.model';
import { mapperFamillesCsv, mapperTotalResponsables } from '../mappers/families.mapper';
import { useFamiliesStore } from '../stores/families.store';

export function useFamiliesViewModel() {
  const store = useFamiliesStore();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const doctrineAccess = useDoctrineAccess();
  const router = useRouter();
  const isAuthorized = computed(() => doctrineAccess.canAccessPage('SCO-003'));
  const canManageFamilies = computed(() => doctrineAccess.canUseAction('scolarite.familles.manage', 'SCO-003'));

  const filters = reactive({
    nomFamille: '',
    nomResponsable: '',
    nomEleve: '',
    page: 1,
    taillePage: 20,
  });

  const createForm = reactive({
    idFamille: '',
    codeFamille: '',
    nomFamille: '',
    telephonePrincipal: '',
    email: '',
    adresse: '',
  });

  const editFamilyForm = reactive({
    nomFamille: '',
    telephonePrincipal: '',
    email: '',
    adresse: '',
  });

  const responsableForm = reactive({
    idResponsableFamille: '',
    nomComplet: '',
    telephone: '',
    telephoneSecondaire: '',
    profession: '',
    lienParente: 'PERE' as 'PERE' | 'MERE' | 'TUTEUR' | 'TUTRICE' | 'AUTRE',
    adresse: '',
    idUtilisateurAuth: '',
  });

  const linkForm = reactive({
    idEleve: '',
  });

  const perimeterMessage = computed(() =>
    `Lecture et mutation bornees a l ecole active ${context.schoolName}, sans delegation sectionnelle.`,
  );

  const totalResponsables = computed(() => mapperTotalResponsables(store.state.entries));

  const hasSearch = computed(() =>
    Boolean(
      filters.nomFamille.trim()
      || filters.nomResponsable.trim()
      || filters.nomEleve.trim(),
    ),
  );

  const canCreate = computed(() =>
    createForm.idFamille.trim().length > 0
    && createForm.codeFamille.trim().length > 0
    && createForm.nomFamille.trim().length > 0
    && createForm.telephonePrincipal.trim().length > 0,
  );

  const canSaveResponsable = computed(() =>
    responsableForm.idResponsableFamille.trim().length > 0
    && responsableForm.nomComplet.trim().length > 0
    && responsableForm.telephone.trim().length > 0,
  );

  const canLinkStudent = computed(() => linkForm.idEleve.trim().length > 0 && Boolean(store.state.selected));

  function nomComplet(eleve: Pick<EleveItem, 'nom' | 'postNom' | 'prenom'>): string {
    return construireNomComplet(eleve.nom, eleve.postNom, eleve.prenom);
  }

  async function charger(): Promise<void> {
    await store.chargerListe({ ...filters });
  }

  async function ouvrirDetail(idFamille: string): Promise<void> {
    await store.chargerDetail(idFamille);
    chargerDepuisSelection();
    await store.evaluerFamilleNombreuse(idFamille);
  }

  async function ouvrirInscriptionFamille(idFamille: string): Promise<void> {
    await router.push(`/app/scolarite/inscriptions?idFamille=${idFamille}`);
  }

  async function ouvrirElevesFamille(): Promise<void> {
    await router.push('/app/scolarite/eleves');
  }

  async function creer(): Promise<void> {
    await store.creer({
      ...createForm,
      email: createForm.email || undefined,
      adresse: createForm.adresse || undefined,
    });
    if (store.state.selected) {
      chargerDepuisSelection();
      await store.evaluerFamilleNombreuse(store.state.selected.idFamille);
    }
  }

  async function modifierFamille(): Promise<void> {
    if (!store.state.selected) return;
    await store.modifier(store.state.selected.idFamille, {
      nomFamille: editFamilyForm.nomFamille || undefined,
      telephonePrincipal: editFamilyForm.telephonePrincipal || undefined,
      email: editFamilyForm.email || undefined,
      adresse: editFamilyForm.adresse || undefined,
      versionAttendue: store.state.selected.version,
    });
  }

  async function ajouterResponsable(): Promise<void> {
    if (!store.state.selected) return;
    await store.ajouterResponsable(store.state.selected.idFamille, {
      idResponsableFamille: responsableForm.idResponsableFamille,
      nomComplet: responsableForm.nomComplet,
      telephone: responsableForm.telephone,
      telephoneSecondaire: responsableForm.telephoneSecondaire || undefined,
      profession: responsableForm.profession || undefined,
      lienParente: responsableForm.lienParente,
      adresse: responsableForm.adresse || undefined,
      estPrincipal: false,
      idUtilisateurAuth: responsableForm.idUtilisateurAuth || undefined,
      versionAttendue: store.state.selected.version,
    });
  }

  async function modifierResponsable(): Promise<void> {
    if (!store.state.selected) return;
    await store.modifierResponsable(store.state.selected.idFamille, responsableForm.idResponsableFamille, {
      idResponsableFamille: responsableForm.idResponsableFamille,
      nomComplet: responsableForm.nomComplet,
      telephone: responsableForm.telephone,
      telephoneSecondaire: responsableForm.telephoneSecondaire || undefined,
      profession: responsableForm.profession || undefined,
      lienParente: responsableForm.lienParente,
      adresse: responsableForm.adresse || undefined,
      estPrincipal: false,
      idUtilisateurAuth: responsableForm.idUtilisateurAuth || undefined,
      versionAttendue: store.state.selected.version,
    });
  }

  async function retirerResponsable(idResponsableFamille: string): Promise<void> {
    if (!store.state.selected) return;
    await store.retirerResponsable(store.state.selected.idFamille, idResponsableFamille, {
      versionAttendue: store.state.selected.version,
    });
  }

  async function definirPrincipal(idResponsableFamille: string): Promise<void> {
    if (!store.state.selected) return;
    await store.definirResponsablePrincipal(store.state.selected.idFamille, idResponsableFamille, {
      versionAttendue: store.state.selected.version,
    });
  }

  async function chargerFamilleNombreuse(): Promise<void> {
    if (!store.state.selected) return;
    await store.evaluerFamilleNombreuse(store.state.selected.idFamille);
  }

  async function rattacherEleve(): Promise<void> {
    if (!store.state.selected) return;
    await store.rattacherEleve(linkForm.idEleve, {
      idFamille: store.state.selected.idFamille,
      versionAttendue: store.state.selected.version,
    });
    linkForm.idEleve = '';
  }

  async function detacherEleve(idEleve: string): Promise<void> {
    if (!store.state.selected) return;
    await store.detacherEleve(idEleve, {
      versionAttendue: store.state.selected.version,
    });
  }

  function chargerResponsable(responsable: ResponsableFamilleItem): void {
    responsableForm.idResponsableFamille = responsable.idResponsableFamille;
    responsableForm.nomComplet = responsable.nomComplet;
    responsableForm.telephone = responsable.telephone;
    responsableForm.telephoneSecondaire = responsable.telephoneSecondaire ?? '';
    responsableForm.profession = responsable.profession ?? '';
    responsableForm.lienParente = responsable.lienParente;
    responsableForm.adresse = responsable.adresse ?? '';
    responsableForm.idUtilisateurAuth = responsable.idUtilisateurAuth ?? '';
  }

  function chargerDepuisSelection(): void {
    if (!store.state.selected) return;
    editFamilyForm.nomFamille = store.state.selected.nomFamille;
    editFamilyForm.telephonePrincipal = store.state.selected.telephonePrincipal;
    editFamilyForm.email = store.state.selected.email ?? '';
    editFamilyForm.adresse = store.state.selected.adresse ?? '';
  }

  function reinitialiserResponsable(): void {
    responsableForm.idResponsableFamille = '';
    responsableForm.nomComplet = '';
    responsableForm.telephone = '';
    responsableForm.telephoneSecondaire = '';
    responsableForm.profession = '';
    responsableForm.lienParente = 'PERE';
    responsableForm.adresse = '';
    responsableForm.idUtilisateurAuth = '';
  }

  function reinitialiserCreation(): void {
    createForm.idFamille = '';
    createForm.codeFamille = '';
    createForm.nomFamille = '';
    createForm.telephonePrincipal = '';
    createForm.email = '';
    createForm.adresse = '';
  }

  function reinitialiserFiltres(): void {
    filters.nomFamille = '';
    filters.nomResponsable = '';
    filters.nomEleve = '';
    filters.page = 1;
    filters.taillePage = 20;
    void charger();
  }

  function exporterCsv(): void {
    const csv = mapperFamillesCsv(store.state.entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'familles.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function imprimer(): void {
    window.print();
  }

  void charger();

  return {
    store,
    session,
    context,
    isAuthorized,
    canManageFamilies,
    filters,
    createForm,
    editFamilyForm,
    responsableForm,
    linkForm,
    perimeterMessage,
    totalResponsables,
    hasSearch,
    canCreate,
    canSaveResponsable,
    canLinkStudent,
    nomComplet,
    charger,
    ouvrirDetail,
    ouvrirInscriptionFamille,
    ouvrirElevesFamille,
    creer,
    modifierFamille,
    ajouterResponsable,
    modifierResponsable,
    retirerResponsable,
    definirPrincipal,
    chargerFamilleNombreuse,
    rattacherEleve,
    detacherEleve,
    chargerResponsable,
    chargerDepuisSelection,
    reinitialiserResponsable,
    reinitialiserCreation,
    reinitialiserFiltres,
    exporterCsv,
    imprimer,
  };
}
