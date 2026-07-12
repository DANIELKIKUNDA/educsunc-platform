<template>
  <PageContainer>
    <nav class="school-detail__breadcrumb" aria-label="Fil d Ariane">
      <span>Plateforme</span>
      <ChevronRight :size="14" />
      <span>Organisations</span>
      <ChevronRight :size="14" />
      <RouterLink class="school-detail__breadcrumb-link" to="/app/organisation/ecoles">
        Registre des organisations
      </RouterLink>
      <ChevronRight :size="14" />
      <strong>{{ store.state.selectedEcole?.nom ?? 'Voir ecole' }}</strong>
    </nav>

    <PageHeader
      eyebrow="Organisation"
      :title="store.state.selectedEcole?.nom ?? 'Voir ecole rattachee'"
      description="Fiche premium d une ecole rattachee a une organisation, avec contexte, informations institutionnelles et ouverture rapide des vrais workflows."
    >
      <template #actions>
        <div class="school-detail__actions">
          <RouterLink class="school-detail__button school-detail__button--ghost" to="/app/organisation/ecoles">
            <ArrowLeft :size="16" />
            <span>Retour registre</span>
          </RouterLink>
          <button class="school-detail__button school-detail__button--soft" type="button" @click="activerOrganisationDansContexte">
            <Building2 :size="16" />
            <span>Activer organisation</span>
          </button>
          <button class="school-detail__button school-detail__button--primary" type="button" @click="activerEcoleDansContexte">
            <BadgeCheck :size="16" />
            <span>Activer ecole</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <LoadingState
      v-if="store.state.status === 'loading'"
      title="Chargement ecole"
      message="Le backend relit l ecole cible et ses informations de contexte."
    />
    <ErrorState
      v-else-if="store.state.status === 'error'"
      title="Ecole indisponible"
      :message="store.state.errorMessage ?? 'Impossible de charger les informations de cette ecole.'"
    />

    <template v-else-if="store.state.selectedEcole">
      <section class="school-detail__hero">
        <div class="school-detail__hero-main">
          <div class="school-detail__hero-tags">
            <span class="school-detail__tag">{{ store.state.selectedEcole.code }}</span>
            <span :class="['school-detail__status', store.state.selectedEcole.actif ? 'is-active' : 'is-inactive']">
              {{ store.state.selectedEcole.actif ? 'Active' : 'Inactive' }}
            </span>
            <span class="school-detail__tag school-detail__tag--muted">
              v{{ store.state.selectedEcole.version }}
            </span>
          </div>
          <h2>{{ store.state.selectedEcole.nom }}</h2>
          <p>
            Cette ecole reste rattachee a l organisation
            <strong>{{ store.state.selectedEcole.idOrganisation }}</strong>
            et peut ouvrir directement les parcours de travail reels apres activation du contexte.
          </p>
        </div>
        <div class="school-detail__hero-side">
          <article class="school-detail__highlight-card">
            <School :size="20" />
            <strong>{{ store.state.selectedEcole.modeExploitation }}</strong>
            <span>Mode d exploitation</span>
          </article>
        </div>
      </section>

      <section class="school-detail__stats">
        <article class="school-stat-card">
          <Building2 :size="20" />
          <strong>{{ store.state.selectedEcole.idOrganisation }}</strong>
          <span>Organisation</span>
        </article>
        <article class="school-stat-card">
          <MapPinned :size="20" />
          <strong>{{ store.state.selectedEcole.provinceEducationnelle || 'Non renseignee' }}</strong>
          <span>Province educationnelle</span>
        </article>
        <article class="school-stat-card">
          <LibraryBig :size="20" />
          <strong>{{ store.state.selectedEcole.modeExploitation }}</strong>
          <span>Mode local</span>
        </article>
        <article class="school-stat-card">
          <Clock3 :size="20" />
          <strong>{{ lireDerniereModification() }}</strong>
          <span>Derniere modification</span>
        </article>
      </section>

      <div class="school-detail__content-grid">
        <div class="school-detail__main-column">
          <SectionBlock title="Identite et institution" description="Lecture detaillee des donnees actuellement portees par le backend pour cette ecole.">
            <div class="school-detail__info-grid">
              <article class="school-detail__info-card">
                <small>Code ecole</small>
                <strong>{{ store.state.selectedEcole.code }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Nom complet</small>
                <strong>{{ store.state.selectedEcole.nom }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Sigle</small>
                <strong>{{ store.state.selectedEcole.sigle || 'Non renseigne' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Mode d exploitation</small>
                <strong>{{ store.state.selectedEcole.modeExploitation }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Statut</small>
                <strong>{{ store.state.selectedEcole.actif ? 'Active' : 'Inactive' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Date de creation</small>
                <strong>{{ formaterDate(store.state.selectedEcole.creeLe, true) }}</strong>
              </article>
            </div>
          </SectionBlock>

          <SectionBlock title="Coordonnees" description="Coordonnees affichables et verifiables avant ouverture des workflows locaux.">
            <div class="school-detail__info-grid">
              <article class="school-detail__info-card">
                <small>Telephone</small>
                <strong>{{ store.state.selectedEcole.telephone || 'Non renseigne' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Email</small>
                <strong>{{ store.state.selectedEcole.email || 'Non renseigne' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Adresse</small>
                <strong>{{ store.state.selectedEcole.adresse || 'Non renseignee' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Ville</small>
                <strong>{{ store.state.selectedEcole.ville || 'Non renseignee' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Commune / territoire</small>
                <strong>{{ store.state.selectedEcole.communeOuTerritoire || 'Non renseigne' }}</strong>
              </article>
              <article class="school-detail__info-card">
                <small>Creee par</small>
                <strong>{{ store.state.selectedEcole.creePar || 'Non renseigne' }}</strong>
              </article>
            </div>
          </SectionBlock>

          <SectionBlock title="Modules activés" description="L ecole n active ici que les modules deja autorises par son organisation.">
            <OrganizationModulesSection
              :model-value="modulesActivesDraft"
              :cards="modulesCards"
              :loading="modulesLoading"
              :save-busy="modulesSaving"
              :save-disabled="!canSaveModules"
              title="Modules activés"
              description="Cette section pilote uniquement les modules utilisables dans cette ecole. Activer l ecole dans le contexte ne modifie jamais ces modules."
              empty-title="Aucun module disponible pour cette ecole"
              empty-message="Cette organisation n a encore autorise aucun module pour cette ecole."
              :selection-summary="modulesSelectionSummary"
              footer-message="Seuls les modules deja autorises par l organisation peuvent etre activés dans cette ecole."
              save-label="Enregistrer les changements"
              :error-message="modulesErrorMessage"
              helper-message="Les modules disponibles proviennent du cadre defini au niveau de l organisation."
              @update:model-value="definirModulesActives"
              @save="ouvrirConfirmationModules"
            />
          </SectionBlock>

          <SectionBlock title="Ouvrir les workflows locaux" description="Ces raccourcis activent le contexte ecole avant ouverture, sans resaisie manuelle.">
            <div class="school-detail__workflow-grid">
              <button class="school-detail__workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/scolarite/inscriptions')">
                <GraduationCap :size="18" />
                <strong>Inscription scolaire</strong>
                <small>Ouvrir le parcours eleve, famille, inscription et affectation.</small>
              </button>
              <button class="school-detail__workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/scolarite/familles')">
                <Users :size="18" />
                <strong>Familles</strong>
                <small>Relire ou creer les familles avant les mutations d inscription.</small>
              </button>
              <button class="school-detail__workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/finances/paiements/enregistrer')">
                <Wallet :size="18" />
                <strong>Perception de paiement</strong>
                <small>Basculer directement sur la caisse de cette ecole active.</small>
              </button>
              <button class="school-detail__workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/pedagogique/resultats/analyses')">
                <ChartColumnBig :size="18" />
                <strong>Analyse pedagogique</strong>
                <small>Ouvrir les resultats et diagnostics dans le bon perimetre.</small>
              </button>
            </div>
          </SectionBlock>
        </div>

        <aside class="school-detail__side-column">
          <SectionBlock title="Pilotage rapide" description="Barre laterale compacte pour accelerer les actions d exploitation locale.">
            <div class="school-detail__side-stack">
              <article class="school-detail__side-card">
                <small>Organisation</small>
                <strong>{{ store.state.selectedEcole.idOrganisation }}</strong>
              </article>
              <article class="school-detail__side-card">
                <small>Version</small>
                <strong>v{{ store.state.selectedEcole.version }}</strong>
              </article>
              <article class="school-detail__side-card">
                <small>Derniere modification</small>
                <strong>{{ lireDerniereModification() }}</strong>
              </article>
            </div>
            <div class="school-detail__side-actions">
              <button class="school-detail__button school-detail__button--soft" type="button" @click="activerOrganisationDansContexte">
                Activer organisation
              </button>
              <button class="school-detail__button school-detail__button--primary" type="button" @click="activerEcoleDansContexte">
                Activer ecole
              </button>
              <RouterLink class="school-detail__button school-detail__button--ghost school-detail__button-link" :to="`/app/administration-ecole/ecoles/${store.state.selectedEcole.id}`">
                Administrer cette ecole
              </RouterLink>
            </div>
          </SectionBlock>
        </aside>
      </div>
    </template>

    <EmptyState
      v-else
      title="Aucune ecole chargee"
      message="Le backend n a retourne aucune ecole pour la route demandee."
    />

    <OrganizationConfirmDialog
      :open="modulesConfirmDialogOpen"
      :busy="modulesSaving"
      title="Enregistrer les modules activés"
      message="Cette action met a jour les modules utilisables dans cette ecole, a l interieur du cadre autorise par l organisation."
      details="Activer le contexte ouvre seulement votre perimetre de travail. Seul cet enregistrement modifie les modules activés de l ecole."
      confirm-label="Enregistrer"
      processing-label="Enregistrement en cours..."
      @close="fermerConfirmationModules"
      @confirm="enregistrerModulesActives"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChartColumnBig,
  ChevronRight,
  Clock3,
  GraduationCap,
  LibraryBig,
  MapPinned,
  School,
  Users,
  Wallet,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { notificationsService } from '../../../services/notifications.service';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import type {
  ConfigurationModuleCatalogItem,
  ConfigurationModuleCode,
} from '../../configuration/models/configuration.model';
import { configurationModuleCatalog } from '../../configuration/models/configuration.model';
import { configurationApi, lireContexteApiConfiguration } from '../../configuration/services/configuration.api';
import OrganizationConfirmDialog from '../components/OrganizationConfirmDialog.vue';
import OrganizationModulesSection from '../components/OrganizationModulesSection.vue';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

const route = useRoute();
const router = useRouter();
const store = useOrganizationGovernanceStore();
const modulesLoading = ref(false);
const modulesSaving = ref(false);
const modulesErrorMessage = ref<string | null>(null);
const modulesConfirmDialogOpen = ref(false);
const modulesAutorisesOrganisation = ref<ConfigurationModuleCode[]>([]);
const modulesActivesDraft = ref<ConfigurationModuleCode[]>([]);
const modulesActivesReference = ref<ConfigurationModuleCode[]>([]);
const modulesEffectifs = ref<ConfigurationModuleCode[]>([]);
const moduleCatalog = ref<readonly ConfigurationModuleCatalogItem[]>(configurationModuleCatalog);

const modulesCards = computed(() => {
  if (modulesAutorisesOrganisation.value.length === 0) {
    return [];
  }

  return moduleCatalog.value
    .filter((module) => modulesAutorisesOrganisation.value.includes(module.code))
    .map((module) => ({
      code: module.code,
      label: module.label,
      description: module.description,
      helper: modulesEffectifs.value.includes(module.code)
        ? 'Actif dans cette ecole.'
        : 'Disponible pour activation dans cette ecole.',
      stateLabel: modulesEffectifs.value.includes(module.code) ? 'Actif' : 'Disponible',
    }));
});
const canSaveModules = computed(() =>
  !modulesLoading.value
  && !modulesSaving.value
  && !areSchoolModuleListsEqual(modulesActivesDraft.value, modulesActivesReference.value),
);
const modulesSelectionSummary = computed(() => {
  const count = modulesActivesDraft.value.length;
  if (count === 0) {
    return 'Aucun module actif dans cette ecole pour le moment.';
  }

  return count === 1
    ? '1 module actif actuellement.'
    : `${count} modules actifs actuellement.`;
});

onMounted(async () => {
  const idEcole = typeof route.params.idEcole === 'string' ? route.params.idEcole : '';
  if (idEcole) {
    await store.chargerEcole(idEcole);
    await chargerCatalogueModules();
    await chargerModulesEcole();
  }
});

async function activerOrganisationDansContexte(): Promise<void> {
  const idOrganisation = store.state.selectedEcole?.idOrganisation;
  if (!idOrganisation) return;
  await changerOrganisationActiveFrontend(idOrganisation);
  activeContextStore.setGovernanceLevel('ORGANISATION');
}

async function activerEcoleDansContexte(): Promise<void> {
  const idOrganisation = store.state.selectedEcole?.idOrganisation;
  const idEcole = store.state.selectedEcole?.id;
  if (!idOrganisation || !idEcole) return;
  await changerOrganisationActiveFrontend(idOrganisation);
  await changerEcoleActiveFrontend(idEcole);
  activeContextStore.setGovernanceLevel('ECOLE');
}

async function ouvrirWorkflowEcole(cible: string): Promise<void> {
  await activerEcoleDansContexte();
  await router.push(cible);
}

async function chargerModulesEcole(): Promise<void> {
  const ecole = store.state.selectedEcole;
  if (!ecole) {
    modulesAutorisesOrganisation.value = [];
    modulesActivesDraft.value = [];
    modulesActivesReference.value = [];
    modulesEffectifs.value = [];
    return;
  }

  modulesLoading.value = true;
  modulesErrorMessage.value = null;

  try {
    const response = await configurationApi.resoudreModulesEffectifs(
      { organisationId: ecole.idOrganisation, ecoleId: ecole.id },
      lireContexteApiConfiguration(),
    );
    modulesAutorisesOrganisation.value = [...response.donnees.modulesAutorisesOrganisation];
    modulesActivesDraft.value = [...response.donnees.modulesActivesEcole];
    modulesActivesReference.value = [...response.donnees.modulesActivesEcole];
    modulesEffectifs.value = [...response.donnees.modulesEffectifs];
  } catch {
    modulesErrorMessage.value = "Impossible de relire les modules disponibles pour cette ecole.";
    modulesAutorisesOrganisation.value = [];
    modulesActivesDraft.value = [];
    modulesActivesReference.value = [];
    modulesEffectifs.value = [];
  } finally {
    modulesLoading.value = false;
  }
}

async function chargerCatalogueModules(): Promise<void> {
  try {
    const response = await configurationApi.consulterCatalogueModules(lireContexteApiConfiguration());
    moduleCatalog.value = response.donnees.modules.length > 0
      ? response.donnees.modules
      : configurationModuleCatalog;
  } catch {
    moduleCatalog.value = configurationModuleCatalog;
  }
}

function definirModulesActives(valeur: string[]): void {
  const autorises = new Set(modulesAutorisesOrganisation.value);
  modulesActivesDraft.value = valeur.filter(
    (module): module is ConfigurationModuleCode =>
      autorises.has(module as ConfigurationModuleCode),
  );
}

function ouvrirConfirmationModules(): void {
  if (!canSaveModules.value) {
    return;
  }

  modulesConfirmDialogOpen.value = true;
}

function fermerConfirmationModules(): void {
  modulesConfirmDialogOpen.value = false;
}

async function enregistrerModulesActives(): Promise<void> {
  const ecole = store.state.selectedEcole;
  if (!ecole || modulesSaving.value) {
    return;
  }

  modulesSaving.value = true;
  modulesErrorMessage.value = null;

  try {
    await configurationApi.configurerModulesEcole(
      ecole.id,
      {
        organisationId: ecole.idOrganisation,
        modules: modulesActivesDraft.value,
      },
      lireContexteApiConfiguration(),
    );
    modulesActivesReference.value = [...modulesActivesDraft.value];
    modulesEffectifs.value = [...modulesActivesDraft.value];
    modulesConfirmDialogOpen.value = false;
    notificationsService.succes(
      'Modules activés mis a jour',
      `${ecole.nom} utilise maintenant la selection locale enregistree.`,
    );
  } catch {
    modulesErrorMessage.value = "Les modules activés n'ont pas pu etre enregistres. Votre selection a ete conservee.";
    notificationsService.danger(
      'Enregistrement impossible',
      "Les modules activés n'ont pas pu etre enregistres pour cette ecole.",
    );
  } finally {
    modulesSaving.value = false;
  }
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
  return formaterDate(
    store.state.selectedEcole?.modifieLe ?? store.state.selectedEcole?.creeLe,
    true,
  );
}

function areSchoolModuleListsEqual(
  current: readonly ConfigurationModuleCode[],
  reference: readonly ConfigurationModuleCode[],
): boolean {
  if (current.length !== reference.length) {
    return false;
  }

  const left = [...current].sort();
  const right = [...reference].sort();
  return left.every((value, index) => value === right[index]);
}
</script>

<style scoped>
.school-detail__breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin-bottom:1rem;color:#5d7388;font-size:.95rem}
.school-detail__breadcrumb strong{color:#17324a}
.school-detail__breadcrumb-link{color:#1741a6;font-weight:700;text-decoration:none}
.school-detail__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.75rem}
.school-detail__hero{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:1rem;align-items:stretch;padding:1.6rem;border-radius:30px;background:radial-gradient(circle at top left,#eef6ff 0,#ffffff 50%,#f8fbff 100%);border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08)}
.school-detail__hero-main,.school-detail__hero-side{display:grid;gap:.9rem}
.school-detail__hero-tags{display:flex;flex-wrap:wrap;gap:.65rem}
.school-detail__tag,.school-detail__status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.school-detail__tag{background:#e9f1ff;color:#1741a6}
.school-detail__tag--muted{background:#f1f5f9;color:#42586b}
.school-detail__status.is-active{background:#eaf8ef;color:#166534}
.school-detail__status.is-inactive{background:#fff2f2;color:#b91c1c}
.school-detail__hero h2{margin:0;color:#11283f;font-size:1.95rem}
.school-detail__hero p{margin:0;color:#587083;line-height:1.7;max-width:72ch}
.school-detail__highlight-card,.school-stat-card,.school-detail__info-card,.school-detail__side-card,.school-detail__workflow-card{transition:all .2s ease}
.school-detail__highlight-card{display:grid;place-items:center;gap:.5rem;text-align:center;padding:1.25rem;border-radius:24px;background:linear-gradient(180deg,#1147d8,#2563eb);color:#fff;box-shadow:0 18px 38px rgba(37,99,235,.26)}
.school-detail__highlight-card span{opacity:.86}
.school-detail__stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:1.1rem}
.school-stat-card{display:grid;place-items:center;text-align:center;gap:.45rem;padding:1.15rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 40px rgba(15,23,42,.08);color:#11283f}
.school-stat-card span{color:#5f7587}
.school-detail__content-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:1rem;margin-top:1.1rem}
.school-detail__main-column,.school-detail__side-column,.school-detail__side-stack,.school-detail__side-actions{display:grid;gap:1rem}
.school-detail__info-grid,.school-detail__workflow-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem}
.school-detail__info-card{display:grid;gap:.4rem;padding:1rem 1.05rem;border-radius:22px;background:linear-gradient(180deg,#fbfdff,#ffffff);border:1px solid rgba(17,40,63,.08);box-shadow:0 16px 36px rgba(15,23,42,.06)}
.school-detail__info-card small,.school-detail__side-card small{color:#5f7587;font-weight:700}
.school-detail__info-card strong,.school-detail__side-card strong{color:#11283f}
.school-detail__workflow-card{display:grid;gap:.6rem;justify-items:start;text-align:left;padding:1.05rem 1.1rem;border-radius:24px;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,#f7fbfd,#ffffff);box-shadow:0 18px 42px rgba(17,40,63,.08);color:#11283f}
.school-detail__workflow-card small{color:#587083;line-height:1.55}
.school-detail__workflow-card:hover,.school-detail__info-card:hover,.school-detail__side-card:hover,.school-stat-card:hover{transform:translateY(-2px);box-shadow:0 24px 48px rgba(15,23,42,.12)}
.school-detail__side-card{display:grid;gap:.35rem;padding:1rem 1.05rem;border-radius:22px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 16px 34px rgba(15,23,42,.06)}
.school-detail__button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.82rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f;text-decoration:none}
.school-detail__button--ghost{background:#f8fbff}
.school-detail__button--soft{background:#eef4ff;color:#1741a6;border-color:rgba(37,99,235,.12)}
.school-detail__button--primary{background:linear-gradient(135deg,#1147d8,#2563eb);border-color:transparent;color:#fff;box-shadow:0 18px 34px rgba(37,99,235,.22)}
.school-detail__button:hover{transform:translateY(-1px)}

@media (max-width: 1024px){
  .school-detail__hero,.school-detail__content-grid{grid-template-columns:1fr}
  .school-detail__stats{grid-template-columns:repeat(2,minmax(0,1fr))}
}

@media (max-width: 720px){
  .school-detail__actions{justify-content:stretch}
  .school-detail__actions .school-detail__button{width:100%}
  .school-detail__stats,.school-detail__info-grid,.school-detail__workflow-grid{grid-template-columns:1fr}
}
</style>
