import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { notificationsService } from '../../../services/notifications.service';
import { organizationGovernanceApi } from '../services/organization-governance.api';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';
import type { OrganisationItem } from '../models/organization-governance.model';
type PendingAction =
  | 'initial-loading'
  | 'refresh'
  | 'create'
  | 'activate'
  | 'deactivate'
  | 'export-excel'
  | 'export-pdf'
  | null;

export function useOrganizationRegistryViewModel() {
  const store = useOrganizationGovernanceStore();
  const { canUseAction } = useDoctrineAccess();
  const route = useRoute();
  const router = useRouter();

  const selectedOrganisationId = ref('');
  const searchTerm = ref('');
  const typeFilter = ref('');
  const statusFilter = ref('');
  const rowsPerPage = ref(10);
  const currentPage = ref(1);
  const isCreationModalOpen = ref(false);
  const isStatusDialogOpen = ref(false);
  const schoolCountByOrganisation = reactive<Record<string, number>>({});
  const pendingAction = ref<PendingAction>('initial-loading');
  const organisationEnAttenteDeStatut = ref<OrganisationItem | null>(null);
  const organisationForm = reactive({
    code: '',
    nom: '',
    typeOrganisation: '',
    description: '',
  });

  const promoteurForm = reactive({
    nomComplet: '',
    telephone: '',
    email: '',
    identifiant: '',
    motDePasseInitial: '',
  });

  const isPromoteurFormStarted = computed(() =>
    promoteurForm.nomComplet.trim().length > 0
    || promoteurForm.telephone.trim().length > 0
    || promoteurForm.email.trim().length > 0
    || promoteurForm.identifiant.trim().length > 0
    || promoteurForm.motDePasseInitial.trim().length > 0,
  );

  const isPromoteurFormComplete = computed(() =>
    promoteurForm.nomComplet.trim().length > 0
    && promoteurForm.email.trim().length > 0
    && promoteurForm.motDePasseInitial.trim().length > 0,
  );

  const canMutateOrganisation = computed(() => canUseAction('organization.write', 'ORG-001'));
  const isBusy = computed(() =>
    store.state.status === 'loading' || store.state.mutationStatus === 'loading',
  );
  const modalErrorMessage = computed(() =>
    isCreationModalOpen.value ? (store.state.errorMessage ?? '') : '',
  );
  const loadingTitle = computed(() => {
    if (pendingAction.value === 'create') return 'Creation en cours';
    if (pendingAction.value === 'activate') return 'Activation en cours';
    if (pendingAction.value === 'deactivate') return 'Desactivation en cours';
    if (pendingAction.value === 'refresh') return 'Actualisation en cours';
    return 'Chargement des organisations';
  });
  const loadingMessage = computed(() =>
    store.state.statusMessage
    ?? 'Lecture des informations en cours...',
  );

  const availableTypes = computed(() =>
    [...new Set(store.state.organisations.map((organisation) => organisation.typeOrganisation))].sort(),
  );

  const filteredOrganisations = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();

    return store.state.organisations.filter((organisation) => {
      const matchesSearch = term.length === 0
        || organisation.code.toLowerCase().includes(term)
        || organisation.nom.toLowerCase().includes(term)
        || (organisation.description ?? '').toLowerCase().includes(term)
        || lirePromoteur(organisation).toLowerCase().includes(term);

      const matchesType = typeFilter.value.length === 0 || organisation.typeOrganisation === typeFilter.value;
      const matchesStatus = statusFilter.value.length === 0
        || (statusFilter.value === 'ACTIVE' ? organisation.actif : !organisation.actif);

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrganisations.value.length / rowsPerPage.value)));
  const paginatedOrganisations = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return filteredOrganisations.value.slice(start, start + rowsPerPage.value);
  });
  const paginationStart = computed(() => (filteredOrganisations.value.length === 0 ? 0 : ((currentPage.value - 1) * rowsPerPage.value) + 1));
  const paginationEnd = computed(() => Math.min(filteredOrganisations.value.length, currentPage.value * rowsPerPage.value));
  const activeCount = computed(() => filteredOrganisations.value.filter((organisation) => organisation.actif).length);
  const inactiveCount = computed(() => filteredOrganisations.value.filter((organisation) => !organisation.actif).length);
  const visibleSchoolsTotal = computed(() =>
    filteredOrganisations.value.reduce((total, organisation) => total + (schoolCountByOrganisation[organisation.id] ?? 0), 0),
  );
  const canSubmitCreation = computed(() =>
    canMutateOrganisation.value
    && organisationForm.code.trim().length > 0
    && organisationForm.nom.trim().length > 0
    && organisationForm.typeOrganisation.trim().length > 0
    && (!isPromoteurFormStarted.value || isPromoteurFormComplete.value),
  );

  watch([searchTerm, typeFilter, statusFilter, rowsPerPage], () => {
    currentPage.value = 1;
  });

  watch(
    () => store.state.errorMessage,
    (message) => {
      if (message && !isCreationModalOpen.value && !isStatusDialogOpen.value) {
        notificationsService.danger('Action impossible', message);
      }
    },
  );

  watch(
    () => store.state.lastMutationMessage,
    (message) => {
      if (message) {
        notificationsService.succes('Operation terminee', message);
      }
    },
  );

  watch(filteredOrganisations, (entries) => {
    if (entries.length === 0) {
      selectedOrganisationId.value = '';
      return;
    }

    if (!entries.some((entry) => entry.id === selectedOrganisationId.value)) {
      selectedOrganisationId.value = entries[0]?.id ?? '';
    }
  });

  function ouvrirCreationModal(): void {
    store.reinitialiserMessages();
    isCreationModalOpen.value = true;
  }

  function fermerCreationModal(): void {
    isCreationModalOpen.value = false;
    store.reinitialiserMessages();
  }

  function reinitialiserCreationForm(): void {
    organisationForm.code = '';
    organisationForm.nom = '';
    organisationForm.typeOrganisation = '';
    organisationForm.description = '';
    promoteurForm.nomComplet = '';
    promoteurForm.telephone = '';
    promoteurForm.email = '';
    promoteurForm.identifiant = '';
    promoteurForm.motDePasseInitial = '';
  }

  async function chargerOrganisations(): Promise<void> {
    await store.chargerOrganisations();
    await chargerCompteursEcoles();
    pendingAction.value = null;
  }

  async function rechargerRegistre(): Promise<void> {
    pendingAction.value = 'refresh';
    await chargerOrganisations();
    if (store.state.status === 'ready') {
      notificationsService.info('Liste actualisee', 'Les organisations visibles ont ete rechargees avec succes.');
    }
  }

  async function chargerCompteursEcoles(): Promise<void> {
    await Promise.all(
      store.state.organisations.map(async (organisation) => {
        try {
          const response = await organizationGovernanceApi.listerEcolesParOrganisation(organisation.id, 1, 1);
          schoolCountByOrganisation[organisation.id] = response.pagination.total;
        } catch {
          schoolCountByOrganisation[organisation.id] = 0;
        }
      }),
    );
  }

  async function creerOrganisation(): Promise<void> {
    if (!canSubmitCreation.value) {
      return;
    }

    pendingAction.value = 'create';
    await store.creerOrganisation({
      code: organisationForm.code.trim(),
      nom: organisationForm.nom.trim(),
      typeOrganisation: organisationForm.typeOrganisation.trim(),
      description: organisationForm.description.trim() || undefined,
      promoteurPrincipal: construirePayloadPromoteurPrincipal(),
    });

    selectedOrganisationId.value = store.state.selectedOrganisation?.id ?? selectedOrganisationId.value;
    await chargerCompteursEcoles();
    if (store.state.status === 'ready') {
      reinitialiserCreationForm();
      fermerCreationModal();
    }
  }

  async function toggleOrganisationStatus(organisation: OrganisationItem): Promise<void> {
    organisationEnAttenteDeStatut.value = organisation;
    store.reinitialiserMessages();
    isStatusDialogOpen.value = true;
  }

  async function activerOrganisationDansContexte(idOrganisation: string): Promise<void> {
    selectedOrganisationId.value = idOrganisation;
    await changerOrganisationActiveFrontend(idOrganisation);
    activeContextStore.setGovernanceLevel('ORGANISATION');
  }

  async function ouvrirAdministrationEcolesPourOrganisation(idOrganisation: string): Promise<void> {
    await router.push(`/app/organisation/organisations/${idOrganisation}/ecoles`);
  }

  async function ouvrirOrganisation(idOrganisation: string): Promise<void> {
    await router.push(`/app/organisation/organisations/${idOrganisation}`);
  }

  async function ouvrirEditionOrganisation(idOrganisation: string): Promise<void> {
    await router.push(`/app/organisation/organisations/${idOrganisation}/modifier`);
  }

  async function confirmerChangementStatut(): Promise<void> {
    const organisation = organisationEnAttenteDeStatut.value;
    if (!organisation) return;

    selectedOrganisationId.value = organisation.id;

    if (organisation.actif) {
      pendingAction.value = 'deactivate';
      await store.desactiverOrganisation(organisation.id);
    } else {
      pendingAction.value = 'activate';
      await store.activerOrganisation(organisation.id);
    }

    if (store.state.status === 'ready') {
      isStatusDialogOpen.value = false;
      organisationEnAttenteDeStatut.value = null;
    }
  }

  function fermerDialogueStatut(): void {
    isStatusDialogOpen.value = false;
    organisationEnAttenteDeStatut.value = null;
    store.reinitialiserMessages();
  }

  function lirePromoteur(organisation: OrganisationItem): string {
    return organisation.promoteurPrincipal?.nomComplet?.trim()
      || organisation.creePar?.trim()
      || 'Responsable non renseigne';
  }

  function construirePayloadPromoteurPrincipal():
    | {
      nomComplet: string;
      email: string;
      telephone?: string;
      identifiant?: string;
      motDePasseInitial: string;
    }
    | undefined {
    const nomComplet = promoteurForm.nomComplet.trim();
    const email = promoteurForm.email.trim().toLowerCase();
    const telephone = promoteurForm.telephone.trim();
    const identifiant = promoteurForm.identifiant.trim();
    const motDePasseInitial = promoteurForm.motDePasseInitial.trim();

    if (!nomComplet || !email || !motDePasseInitial) {
      return undefined;
    }

    return {
      nomComplet,
      email,
      telephone: telephone || undefined,
      identifiant: identifiant || undefined,
      motDePasseInitial,
    };
  }

  function formaterDate(value: string | undefined, withTime = false): string {
    if (!value) {
      return 'Non renseignee';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
  }

  function telechargerFichier(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function echapperHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function exporterExcel(): void {
    pendingAction.value = 'export-excel';
    const headers = [
      'Code',
      'Organisation',
      'Responsable',
      'Type',
      "Nombre d'ecoles",
      'Statut',
      'Date de creation',
      'Derniere modification',
    ];
    const rows = filteredOrganisations.value.map((organisation) => [
      organisation.code,
      organisation.nom,
      lirePromoteur(organisation),
      organisation.typeOrganisation,
      String(schoolCountByOrganisation[organisation.id] ?? 0),
      organisation.actif ? 'Active' : 'Inactive',
      formaterDate(organisation.creeLe),
      formaterDate(organisation.modifieLe ?? organisation.creeLe, true),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
      .join('\n');

    telechargerFichier(csv, 'registre-organisations.csv', 'text/csv;charset=utf-8;');
    pendingAction.value = null;
    notificationsService.succes('Export termine', 'Votre telechargement Excel va commencer.');
  }

  function exporterPdf(): void {
    pendingAction.value = 'export-pdf';
    const printableRows = filteredOrganisations.value.map((organisation) => `
      <tr>
        <td>${echapperHtml(organisation.code)}</td>
        <td>${echapperHtml(organisation.nom)}</td>
        <td>${echapperHtml(lirePromoteur(organisation))}</td>
        <td>${echapperHtml(organisation.typeOrganisation)}</td>
        <td>${schoolCountByOrganisation[organisation.id] ?? 0}</td>
        <td>${organisation.actif ? 'Active' : 'Inactive'}</td>
        <td>${echapperHtml(formaterDate(organisation.creeLe))}</td>
        <td>${echapperHtml(formaterDate(organisation.creeLe, true))}</td>
      </tr>
    `).join('');

    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800');
    if (!popup) {
      pendingAction.value = null;
      notificationsService.danger('Export impossible', 'Le navigateur a bloque l ouverture de la fenetre d impression.');
      return;
    }

    popup.document.write(`
      <html lang="fr">
        <head>
          <title>Registre des organisations</title>
          <style>
            body{font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#11283f}
            h1{margin:0 0 8px;font-size:28px}
            p{margin:0 0 24px;color:#587083}
            table{width:100%;border-collapse:collapse}
            th,td{border:1px solid #d9e2ec;padding:10px;text-align:left;font-size:13px}
            th{background:#f5f8fb}
          </style>
        </head>
        <body>
          <h1>Registre des organisations</h1>
          <p>Extraction au ${echapperHtml(new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Organisation</th>
                <th>Responsable</th>
                <th>Type</th>
                <th>Nombre d'ecoles</th>
                <th>Statut</th>
                <th>Date de creation</th>
                <th>Derniere modification</th>
              </tr>
            </thead>
            <tbody>${printableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    pendingAction.value = null;
    notificationsService.succes('Export termine', 'La version imprimable du registre est prete.');
  }

  async function initialiserDepuisContexte(): Promise<void> {
    selectedOrganisationId.value =
      (typeof route.query.idOrganisation === 'string' && route.query.idOrganisation)
      || (activeContextStore.state.governanceLevel === 'ORGANISATION' ? activeContextStore.state.organizationId : '')
      || selectedOrganisationId.value;

    await chargerOrganisations();
  }

  void initialiserDepuisContexte();

  return {
    store,
    selectedOrganisationId,
    searchTerm,
    typeFilter,
    statusFilter,
    rowsPerPage,
    currentPage,
    isCreationModalOpen,
    isStatusDialogOpen,
    organisationEnAttenteDeStatut,
    organisationForm,
    promoteurForm,
    canMutateOrganisation,
    isBusy,
    modalErrorMessage,
    loadingTitle,
    loadingMessage,
    availableTypes,
    filteredOrganisations,
    totalPages,
    paginatedOrganisations,
    paginationStart,
    paginationEnd,
    activeCount,
    inactiveCount,
    visibleSchoolsTotal,
    canSubmitCreation,
    schoolCountByOrganisation,
    ouvrirCreationModal,
    fermerCreationModal,
    rechargerRegistre,
    creerOrganisation,
    toggleOrganisationStatus,
    ouvrirAdministrationEcolesPourOrganisation,
    ouvrirOrganisation,
    ouvrirEditionOrganisation,
    confirmerChangementStatut,
    fermerDialogueStatut,
    lirePromoteur,
    formaterDate,
    exporterExcel,
    exporterPdf,
  };
}
