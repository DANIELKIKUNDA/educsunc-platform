import { computed, onMounted, reactive, ref } from 'vue';
import { notificationsService } from '../../../services/notifications.service';
import type { SecurityAccount, SecurityAdministrator, SecurityAdministratorPayload } from '../../security/models/security.model';
import { securityApi } from '../../security/services/security.api';

function objet(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function texte(value: unknown): string { return typeof value === 'string' ? value : ''; }
function nombre(value: unknown): number { return Number.isFinite(Number(value)) ? Number(value) : 0; }

function mapperAdministrateur(value: unknown): SecurityAdministrator {
  const row = objet(value);
  return {
    idAffectation: texte(row.idAffectation ?? row.id_affectation),
    idUtilisateur: texte(row.idUtilisateur ?? row.id_utilisateur),
    nomComplet: texte(row.nomComplet ?? row.nom_complet),
    email: texte(row.email),
    telephone: texte(row.telephone) || undefined,
    etatCompte: (texte(row.etatCompte ?? row.etat_compte) || 'ACTIVE') as SecurityAdministrator['etatCompte'],
    etatAffectation: texte(row.etatAffectation ?? row.etat_affectation),
    organisationId: texte(row.organisationId ?? row.organisation_id) || undefined,
    organisationNom: texte(row.organisationNom ?? row.organisation_nom) || undefined,
    dernierAcces: texte(row.dernierAcces ?? row.dernier_acces) || undefined,
    sessionsActives: nombre(row.sessionsActives ?? row.sessions_actives),
  };
}

function mapperCompte(value: unknown): SecurityAccount {
  const row = objet(value);
  return {
    id: texte(row.id ?? row.idUtilisateur ?? row.id_utilisateur),
    nomComplet: texte(row.nomComplet ?? row.nom_complet),
    email: texte(row.email),
    telephone: texte(row.telephone) || undefined,
    etat: (texte(row.etat) || 'ACTIVE') as SecurityAccount['etat'],
    affectations: [],
    sessionsActives: nombre(row.sessionsActives ?? row.sessions_actives),
  };
}

export function useOrganizationAccessAdministration(organisationId: string) {
  const loading = ref(true);
  const saving = ref(false);
  const error = ref('');
  const dialogOpen = ref(false);
  const mode = ref<'new' | 'existing'>('new');
  const administrators = ref<SecurityAdministrator[]>([]);
  const accounts = ref<SecurityAccount[]>([]);
  const form = reactive({
    idUtilisateur: '', nomComplet: '', email: '', telephone: '', motDePasseInitial: '', motif: '',
  });

  const organizationAdministrators = computed(() =>
    administrators.value.filter((item) => item.organisationId === organisationId),
  );
  const availableAccounts = computed(() => accounts.value.filter((account) =>
    account.etat === 'ACTIVE' && !organizationAdministrators.value.some((admin) => admin.idUtilisateur === account.id),
  ));
  const canSave = computed(() => Boolean(
    form.motif.trim()
    && (mode.value === 'existing'
      ? form.idUtilisateur
      : form.nomComplet.trim() && form.email.trim() && form.motDePasseInitial.length >= 12),
  ));

  async function load(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      const [adminsRaw, accountsRaw] = await Promise.all([
        securityApi.listerAdministrateursOrganisations(),
        securityApi.listerComptes({ limite: 100 }),
      ]);
      const adminsObject = objet(adminsRaw);
      const accountsObject = objet(accountsRaw);
      const adminRows = Array.isArray(adminsRaw) ? adminsRaw : (adminsObject.elements ?? adminsObject.administrateurs ?? []);
      const accountRows = Array.isArray(accountsRaw) ? accountsRaw : (accountsObject.elements ?? accountsObject.comptes ?? []);
      administrators.value = Array.isArray(adminRows) ? adminRows.map(mapperAdministrateur) : [];
      accounts.value = Array.isArray(accountRows) ? accountRows.map(mapperCompte) : [];
    } catch {
      error.value = 'Les responsables techniques de cette organisation ne peuvent pas être chargés pour le moment.';
    } finally {
      loading.value = false;
    }
  }

  function open(): void {
    Object.assign(form, { idUtilisateur: '', nomComplet: '', email: '', telephone: '', motDePasseInitial: '', motif: '' });
    mode.value = 'new';
    dialogOpen.value = true;
  }

  function close(): void { if (!saving.value) dialogOpen.value = false; }

  async function save(): Promise<void> {
    if (!canSave.value || saving.value) return;
    saving.value = true;
    const payload: SecurityAdministratorPayload = mode.value === 'existing'
      ? { idUtilisateur: form.idUtilisateur, motif: form.motif.trim() }
      : {
          nomComplet: form.nomComplet.trim(), email: form.email.trim(),
          telephone: form.telephone.trim() || undefined,
          motDePasseInitial: form.motDePasseInitial, motif: form.motif.trim(),
        };
    try {
      await securityApi.creerAdministrateurOrganisation(organisationId, payload);
      dialogOpen.value = false;
      notificationsService.succes('Responsable ajouté', 'L’administration système de cette organisation a été mise à jour.');
      await load();
    } catch {
      notificationsService.danger('Action impossible', 'Le responsable n’a pas été ajouté. Vérifiez les informations puis réessayez.');
    } finally {
      saving.value = false;
    }
  }

  onMounted(load);
  return { loading, saving, error, dialogOpen, mode, form, organizationAdministrators, availableAccounts, canSave, load, open, close, save };
}
