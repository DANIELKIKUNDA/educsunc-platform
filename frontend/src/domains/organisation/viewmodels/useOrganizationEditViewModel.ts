import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notificationsService } from '../../../services/notifications.service';
import { createFormSnapshot, hasFormChanged } from '../../../shared/forms/form-snapshot';
import { organizationTypeOptions } from '../models/organization-governance.model';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';
import { evaluateOrganizationEdit } from './organization-form.validation';

interface OrganisationEditSnapshot {
  nom: string;
  typeOrganisation: string;
  description: string;
  responsableNomComplet: string;
  responsableTelephone: string;
  responsableEmail: string;
  responsableIdentifiant: string;
}

export function useOrganizationEditViewModel() {
  const route = useRoute();
  const router = useRouter();
  const store = useOrganizationGovernanceStore();
  const initialSnapshot = ref<string | null>(null);
  const confirmLeaveOpen = ref(false);
  const formReady = ref(false);

  const organisationId = computed(() =>
    typeof route.params.idOrganisation === 'string' ? route.params.idOrganisation : '',
  );

  const organisation = computed(() => store.state.selectedOrganisation);
  const isLoading = computed(() => store.state.status === 'loading'
    || (!formReady.value && store.state.status !== 'error'));
  const isSaving = computed(() => store.state.mutationStatus === 'loading');
  const errorMessage = computed(() =>
    store.state.status === 'error'
      ? "Impossible de charger les informations de l'organisation. Veuillez reessayer."
      : null
  );

  const form = reactive({
    nom: '',
    typeOrganisation: '',
    description: '',
    responsableNomComplet: '',
    responsableTelephone: '',
    responsableEmail: '',
    responsableIdentifiant: '',
  });

  const typeOptions = organizationTypeOptions;

  const validationErrors = computed(() => evaluateOrganizationEdit({
    nom: form.nom,
    typeOrganisation: form.typeOrganisation,
    responsableEmail: form.responsableEmail,
  }));
  const nomError = computed(() => validationErrors.value.nom ?? '');
  const responsableEmailError = computed(() => validationErrors.value.responsableEmail ?? '');
  const hasChanges = computed(() => hasFormChanged(initialSnapshot.value, construireSnapshot()));

  const canSubmit = computed(() =>
    Object.keys(validationErrors.value).length === 0
    && hasChanges.value
    && !isSaving.value,
  );

  async function chargerOrganisation(): Promise<void> {
    if (!organisationId.value) {
      return;
    }

    formReady.value = false;
    await store.chargerOrganisation(organisationId.value);
    hydraterFormulaire();
  }

  function hydraterFormulaire(): void {
    const source = store.state.selectedOrganisation;
    if (!source) {
      return;
    }

    form.nom = source.nom ?? '';
    form.typeOrganisation = source.typeOrganisation ?? '';
    form.description = source.description ?? '';
    form.responsableNomComplet = source.promoteurPrincipal?.nomComplet ?? '';
    form.responsableTelephone = source.promoteurPrincipal?.telephone ?? '';
    form.responsableEmail = source.promoteurPrincipal?.email ?? '';
    form.responsableIdentifiant = source.promoteurPrincipal?.identifiant ?? '';
    initialSnapshot.value = createFormSnapshot(construireSnapshot());
    formReady.value = true;
  }

  async function enregistrer(): Promise<void> {
    if (!organisation.value) return;

    if (form.nom.trim().length === 0 || form.typeOrganisation.trim().length === 0) {
      notificationsService.attention(
        'Champs obligatoires manquants',
        "Veuillez remplir les champs obligatoires avant d'enregistrer.",
      );
      return;
    }

    if (responsableEmailError.value.length > 0) {
      notificationsService.attention('Email invalide', responsableEmailError.value);
      return;
    }

    if (!canSubmit.value) {
      return;
    }

    await store.mettreAJourOrganisation(organisation.value.id, {
      nom: form.nom.trim(),
      typeOrganisation: form.typeOrganisation.trim(),
      description: form.description.trim() || undefined,
      promoteurPrincipal: form.responsableNomComplet.trim().length > 0
        ? {
          nomComplet: form.responsableNomComplet.trim(),
          telephone: form.responsableTelephone.trim() || undefined,
          email: form.responsableEmail.trim().toLowerCase() || undefined,
          identifiant: form.responsableIdentifiant.trim() || undefined,
        }
        : undefined,
    });

    if (store.state.errorMessage) {
      notificationsService.danger(
        'Enregistrement impossible',
        "Impossible d'enregistrer les modifications. Veuillez reessayer.",
      );
      return;
    }

    if (store.state.selectedOrganisation) {
      hydraterFormulaire();
      notificationsService.succes(
        'Organisation mise a jour',
        "Les informations de l'organisation ont ete mises a jour avec succes.",
      );
    }
  }

  async function retournerRegistre(): Promise<void> {
    await router.push('/app/organisation/ecoles');
  }

  async function retournerDetail(): Promise<void> {
    if (!organisation.value) {
      await retournerRegistre();
      return;
    }

    await router.push(`/app/organisation/organisations/${organisation.value.id}`);
  }

  async function annuler(): Promise<void> {
    if (hasChanges.value) {
      confirmLeaveOpen.value = true;
      return;
    }

    await retournerDetail();
  }

  function fermerConfirmationSortie(): void {
    confirmLeaveOpen.value = false;
    notificationsService.info('Action annulee', 'Vous restez sur le formulaire courant.');
  }

  async function confirmerSortieSansSauvegarde(): Promise<void> {
    confirmLeaveOpen.value = false;
    await retournerDetail();
  }

  function construireSnapshot(): OrganisationEditSnapshot {
    return {
      nom: form.nom.trim(),
      typeOrganisation: form.typeOrganisation.trim(),
      description: form.description.trim(),
      responsableNomComplet: form.responsableNomComplet.trim(),
      responsableTelephone: form.responsableTelephone.trim(),
      responsableEmail: form.responsableEmail.trim().toLowerCase(),
      responsableIdentifiant: form.responsableIdentifiant.trim(),
    };
  }

  function formaterDate(value?: string, withTime = false): string {
    if (!value) return 'Non renseigne';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
  }

  function lireDerniereModification(): string {
    return formaterDate(organisation.value?.modifieLe ?? organisation.value?.creeLe, true);
  }

  onMounted(async () => {
    await chargerOrganisation();
  });

  return {
    organisation,
    form,
    typeOptions,
    isLoading,
    isSaving,
    errorMessage,
    hasChanges,
    canSubmit,
    nomError,
    responsableEmailError,
    confirmLeaveOpen,
    chargerOrganisation,
    enregistrer,
    annuler,
    retournerRegistre,
    retournerDetail,
    fermerConfirmationSortie,
    confirmerSortieSansSauvegarde,
    formaterDate,
    lireDerniereModification,
  };
}
