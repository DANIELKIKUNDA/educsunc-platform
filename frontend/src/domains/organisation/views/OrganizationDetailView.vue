<template>
  <PageContainer>
    <nav class="org-detail__breadcrumb" aria-label="Fil d Ariane">
      <span>Plateforme</span>
      <ChevronRight :size="14" />
      <span>Organisations</span>
      <ChevronRight :size="14" />
      <button type="button" class="org-detail__breadcrumb-link" @click="retournerRegistre">
        Registre des organisations
      </button>
      <ChevronRight :size="14" />
      <strong>{{ organisation?.nom ?? 'Voir organisation' }}</strong>
    </nav>

    <PageHeader
      eyebrow="Organisation"
      :title="organisation?.nom ?? 'Voir organisation'"
      description="Fiche complete de l organisation selectionnee, avec ses informations generales, son responsable, ses ecoles rattachees et son historique."
    >
      <template #actions>
        <div class="org-detail__actions">
          <button class="org-detail__button org-detail__button--ghost" type="button" @click="retournerRegistre">
            <ArrowLeft :size="16" />
            <span>Retour au registre</span>
          </button>
          <button class="org-detail__button org-detail__button--soft" type="button" :disabled="isBusy" @click="ouvrirDialogueStatut">
            <Power :size="16" />
            <span>{{ organisation?.actif ? 'Desactiver' : 'Activer' }}</span>
          </button>
          <button class="org-detail__button org-detail__button--primary" type="button" @click="ouvrirEdition">
            <PencilLine :size="16" />
            <span>Modifier</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <OrganizationDetailSkeleton v-if="isLoading && !organisation" />
    <ErrorState
      v-else-if="errorMessage && !organisation"
      title="Organisation indisponible"
      :message="errorMessage"
    />
    <template v-else-if="organisation">
      <section class="org-detail__hero">
        <div class="org-detail__hero-main">
          <div class="org-detail__eyebrow">
            <span class="org-detail__code">{{ organisation.code }}</span>
            <span :class="['org-detail__status', organisation.actif ? 'is-active' : 'is-inactive']">
              {{ organisation.actif ? 'Active' : 'Inactive' }}
            </span>
            <span class="org-detail__version">{{ lireVersion() }}</span>
          </div>
          <h2>{{ organisation.nom }}</h2>
          <p>{{ lireDescriptionOrganisation() }}</p>
          <div class="org-detail__hero-actions">
            <button class="org-detail__button org-detail__button--soft" type="button" :disabled="isBusy" @click="activerOrganisationDansContexte">
              <BadgeCheck :size="16" />
              <span>Activer dans le contexte</span>
            </button>
            <button class="org-detail__button org-detail__button--ghost" type="button" @click="ouvrirConfigurationModules">
              <Layers3 :size="16" />
              <span>Configurer les modules</span>
            </button>
            <RouterLink class="org-detail__button org-detail__button--ghost org-detail__button-link" :to="`/app/organisation/organisations/${organisation.id}/ecoles`">
              <School :size="16" />
              <span>Voir toutes les ecoles</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="org-detail__stats">
        <StatCard label="Ecoles rattachees" :value="stats.ecoles" hint="structure organisationnelle" :icon="Building2" tone="primary" />
        <StatCard label="Utilisateurs" :value="stats.utilisateurs" hint="dans le perimetre visible" :icon="Users" tone="success" />
        <StatCard label="Modules autorises" :value="stats.modules" hint="catalogue ouvert a l organisation" :icon="Layers3" tone="neutral" />
        <StatCard label="Derniere modification" :value="stats.derniereModification" hint="trace la plus recente" :icon="Clock3" tone="warning" />
      </section>

      <PremiumTabs
        class="org-detail__tabs"
        :ariaLabel="'Navigation detail organisation'"
        :model-value="activeTab"
        :tabs="tabs"
        @update:model-value="selectionnerOnglet($event as never)"
      />

      <div class="org-detail__content-grid">
        <div class="org-detail__main-panel">
          <SectionBlock
            v-if="activeTab === 'general'"
            title="Informations generales"
            description="Lecture complete des informations generales de cette organisation."
          >
            <div class="org-detail__info-grid">
              <div class="org-detail__info-card">
                <small>Code</small>
                <strong>{{ organisation.code }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Nom</small>
                <strong>{{ organisation.nom || 'Non renseignee' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Description</small>
                <strong>{{ organisation.description || 'Non renseignee' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Type</small>
                <strong>{{ organisation.typeOrganisation || 'Non renseigne' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Statut</small>
                <strong>{{ organisation.actif ? 'Active' : 'Inactive' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Date de creation</small>
                <strong>{{ formaterDate(organisation.creeLe, true) }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Derniere modification</small>
                <strong>{{ lireDerniereModification() }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Version</small>
                <strong>{{ lireVersion() }}</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            v-else-if="activeTab === 'responsable'"
            title="Responsable"
            description="Lecture du responsable principal actuellement rattache a cette organisation."
          >
            <div class="org-detail__info-grid">
              <div class="org-detail__info-card">
                <small>Nom complet</small>
                <strong>{{ lirePromoteurPrincipal() }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Telephone</small>
                <strong>{{ organisation.promoteurPrincipal?.telephone || 'Non renseigne' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Adresse mail</small>
                <strong>{{ organisation.promoteurPrincipal?.email || 'Non renseignee' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Identifiant</small>
                <strong>{{ organisation.promoteurPrincipal?.identifiant || 'Non renseigne' }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Statut du compte</small>
                <strong>{{ lireEtatCompteResponsable() }}</strong>
              </div>
              <div class="org-detail__info-card">
                <small>Date d affectation</small>
                <strong>{{ formaterDate(organisation.creeLe, true) }}</strong>
              </div>
            </div>
            <div class="org-detail__sensitive-actions">
              <button class="org-detail__button org-detail__button--ghost" type="button" @click="ouvrirActionResponsable('La modification des informations du responsable')">
                Modifier les informations
              </button>
              <button class="org-detail__button org-detail__button--ghost" type="button" @click="ouvrirActionResponsable('Le remplacement du responsable principal')">
                Remplacer le responsable
              </button>
              <button class="org-detail__button org-detail__button--ghost" type="button" @click="ouvrirActionResponsable('La reinitialisation du mot de passe du responsable')">
                Reinitialiser le mot de passe
              </button>
              <button class="org-detail__button org-detail__button--ghost" type="button" @click="ouvrirActionResponsable('La desactivation du compte responsable')">
                Desactiver le compte
              </button>
            </div>
            <p class="org-detail__hint">
              Les actions sensibles du responsable principal restent separees des informations generales de l organisation.
            </p>
          </SectionBlock>

          <SectionBlock
            v-else-if="activeTab === 'modules'"
            title="Modules autorises"
            description="Attribuez ici les modules que cette organisation peut ensuite ouvrir a ses ecoles."
          >
            <OrganizationModulesSection
              :model-value="modulesDraft"
              :cards="modulesCards"
              :loading="modulesStatus === 'loading'"
              :save-busy="modulesMutationStatus === 'loading'"
              :save-disabled="!canSaveModules"
              title="Modules autorises"
              description="Cette attribution reste propre a l organisation. Activer le contexte ne change jamais ces modules."
              empty-title="Aucun module disponible"
              empty-message="Le catalogue officiel des modules n est pas encore disponible pour cette organisation."
              :selection-summary="modulesSelectionSummary"
              footer-message="Enregistrez seulement lorsque la selection correspond bien au cadre que vous souhaitez autoriser aux ecoles rattachees."
              save-label="Enregistrer les changements"
              :error-message="modulesErrorMessage"
              helper-message="Les ecoles rattachees ne pourront activer que les modules autorises ici."
              @update:model-value="definirModulesOrganisation"
              @save="demanderEnregistrementModules"
            />
          </SectionBlock>

          <SectionBlock
            v-else-if="activeTab === 'ecoles'"
            title="Ecoles rattachees"
            description="Apercu des ecoles actuellement rattachees a cette organisation."
          >
            <div v-if="ecolesApercu.length === 0" class="org-detail__empty">
              <School :size="18" />
              <div>
                <strong>Aucune ecole n est encore rattachee a cette organisation.</strong>
                <p>Vous pouvez creer une ecole pour commencer a structurer cette organisation.</p>
              </div>
              <RouterLink class="org-detail__button org-detail__button--primary org-detail__empty-action" to="/app/administration-ecole/ecoles">
                Creer une ecole
              </RouterLink>
            </div>
            <div v-else class="org-detail__schools-preview">
              <div class="org-detail__schools-table-wrapper">
                <table class="org-detail__schools-table">
                  <thead>
                    <tr>
                      <th>Code ecole</th>
                      <th>Nom de l ecole</th>
                      <th>Province educationnelle</th>
                      <th>Sections organisees</th>
                      <th>Modules activés</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ecole in ecolesApercu" :key="ecole.id">
                      <td>{{ ecole.code }}</td>
                      <td>{{ ecole.nom }}</td>
                      <td>{{ ecole.provinceEducationnelle || 'Non renseignee' }}</td>
                      <td>{{ lireSectionsOrganisees() }}</td>
                      <td>{{ lireModulesActives(ecole.id) }}</td>
                      <td>
                        <span :class="['org-detail__status', ecole.actif ? 'is-active' : 'is-inactive']">
                          {{ ecole.actif ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="org-detail__preview-footer">
                <RouterLink class="org-detail__button org-detail__button--ghost org-detail__button-link" :to="`/app/organisation/organisations/${organisation.id}/ecoles`">
                  Voir toutes les ecoles
                </RouterLink>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            v-else
            title="Historique"
            description="Chronologie verticale de l activite disponible pour cette organisation."
          >
            <div v-if="historique.length === 0" class="org-detail__empty">
              <History :size="18" />
              <div>
                <strong>Aucune activite enregistree.</strong>
                <p>Aucune activite n a encore ete enregistree pour cette organisation.</p>
              </div>
            </div>
            <ol v-else class="org-detail__timeline">
              <li v-for="evenement in historique" :key="evenement.id" class="org-detail__timeline-item">
                <span class="org-detail__timeline-dot" />
                <div class="org-detail__timeline-card">
                  <div class="org-detail__timeline-meta">
                    <strong>{{ evenement.titre }}</strong>
                    <span>{{ formaterDate(evenement.date, true) }}</span>
                  </div>
                  <p>{{ evenement.description }}</p>
                  <small>Auteur : {{ evenement.auteur }}</small>
                </div>
              </li>
            </ol>
          </SectionBlock>
        </div>

        <aside class="org-detail__sidebar">
          <SectionBlock title="Informations rapides" description="Resume contextuel de l organisation.">
            <div class="org-detail__quick-grid">
              <div v-for="item in infoRapide" :key="item.label" class="org-detail__quick-card">
                <small>{{ item.label }}</small>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
            <div class="org-detail__sidebar-actions">
              <button class="org-detail__button org-detail__button--soft" type="button" :disabled="isBusy" @click="activerOrganisationDansContexte">
                Activer le contexte
              </button>
              <RouterLink class="org-detail__button org-detail__button--ghost org-detail__button-link" :to="`/app/organisation/organisations/${organisation.id}/ecoles`">
                Ouvrir les ecoles
              </RouterLink>
            </div>
            <p class="org-detail__hint">Les informations affichees ici suivent les donnees actuellement disponibles dans le systeme.</p>
          </SectionBlock>
        </aside>
      </div>
    </template>

    <OrganizationConfirmDialog
      :open="statusDialogOpen"
      :busy="isBusy"
      :title="organisation?.actif ? 'Desactiver l organisation' : 'Activer l organisation'"
      :message="organisation?.actif
        ? 'Cette action suspend l organisation dans la plateforme sans supprimer ses ecoles ni son historique.'
        : 'Cette action remet l organisation a disposition dans la plateforme.'"
      :details="organisation ? `Organisation cible : ${organisation.nom} (${organisation.code}).` : 'Aucune organisation selectionnee.'"
      :confirm-label="organisation?.actif ? 'Desactiver' : 'Activer'"
      :processing-label="organisation?.actif ? 'Desactivation en cours...' : 'Activation en cours...'"
      @close="fermerDialogueStatut"
      @confirm="confirmerChangementStatut"
    />

    <OrganizationConfirmDialog
      :open="modulesConfirmDialogOpen"
      :busy="modulesMutationStatus === 'loading'"
      title="Enregistrer les modules autorises"
      message="Cette action met a jour les modules que cette organisation pourra ensuite ouvrir a ses ecoles."
      details="Activer le contexte reste une simple selection de travail. Seul cet enregistrement modifie les modules autorises."
      confirm-label="Enregistrer"
      processing-label="Enregistrement en cours..."
      @close="fermerDialogueModules"
      @confirm="confirmerEnregistrementModules"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronRight,
  Clock3,
  History,
  Info,
  Layers3,
  PencilLine,
  Power,
  School,
  ShieldUser,
  Users,
} from 'lucide-vue-next';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import PremiumTabs from '../../../shared/ui/PremiumTabs.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import OrganizationConfirmDialog from '../components/OrganizationConfirmDialog.vue';
import OrganizationDetailSkeleton from '../components/OrganizationDetailSkeleton.vue';
import OrganizationModulesSection from '../components/OrganizationModulesSection.vue';
import { useOrganizationDetailViewModel } from '../viewmodels/useOrganizationDetailViewModel';

const {
  organisation,
  ecolesApercu,
  isLoading,
  errorMessage,
  isBusy,
  stats,
  activeTab,
  infoRapide,
  historique,
  modulesCards,
  modulesDraft,
  modulesStatus,
  modulesMutationStatus,
  modulesErrorMessage,
  modulesSelectionSummary,
  canSaveModules,
  modulesConfirmDialogOpen,
  statusDialogOpen,
  activerOrganisationDansContexte,
  ouvrirActionResponsable,
  ouvrirEdition,
  ouvrirConfigurationModules,
  retournerRegistre,
  ouvrirDialogueStatut,
  fermerDialogueStatut,
  confirmerChangementStatut,
  selectionnerOnglet,
  demanderEnregistrementModules,
  fermerDialogueModules,
  confirmerEnregistrementModules,
  definirModulesOrganisation,
  lirePromoteurPrincipal,
  lireDescriptionOrganisation,
  lireVersion,
  lireDerniereModification,
  lireEtatCompteResponsable,
  lireSectionsOrganisees,
  lireModulesActives,
  formaterDate,
} = useOrganizationDetailViewModel();

const tabs = computed(() => [
  { code: 'general', label: 'Informations generales', icon: Info },
  { code: 'responsable', label: 'Responsable', icon: ShieldUser },
  { code: 'modules', label: 'Modules autorises', icon: Layers3 },
  { code: 'ecoles', label: 'Ecoles rattachees', icon: School },
  { code: 'historique', label: 'Historique', icon: History },
] as const);
</script>

<style scoped>
.org-detail__breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin-bottom:1rem;color:#5d7388;font-size:.95rem}
.org-detail__breadcrumb strong{color:#17324a}
.org-detail__breadcrumb-link{padding:0;border:none;background:transparent;color:#0d5f7a;font-weight:700}
.org-detail__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.75rem}
.org-detail__button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;border-radius:18px;padding:.85rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(245,249,253,.98));color:#11283f;transition:all .2s ease;box-shadow:0 10px 24px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.92)}
.org-detail__button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 30px rgba(15,23,42,.1)}
.org-detail__button-link{text-decoration:none}
.org-detail__button--primary{background:linear-gradient(135deg,#0b5d7a 0%, #1180a3 52%, #1ca6bf 100%);border-color:rgba(9,95,118,.22);color:#fff;box-shadow:0 18px 34px rgba(14,110,138,.22)}
.org-detail__button--soft{background:linear-gradient(180deg,#f0fbfe,#e6f7fb);color:#0d5f7a;border-color:rgba(20,135,168,.16)}
.org-detail__button--ghost{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(245,249,253,.98))}
.org-detail__button:disabled{opacity:.6;cursor:not-allowed;box-shadow:none;transform:none}
.org-detail__hero{padding:1.6rem;border-radius:32px;background:radial-gradient(circle at top left,#eefbfd 0,#ffffff 50%,#f4fbfd 100%);border:1px solid rgba(17,40,63,.08);box-shadow:0 28px 65px rgba(15,23,42,.08)}
.org-detail__hero-main{display:grid;gap:1rem}
.org-detail__eyebrow{display:flex;flex-wrap:wrap;gap:.7rem;align-items:center}
.org-detail__code,.org-detail__version{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-detail__code{background:#e6f7fb;color:#0d5f7a}
.org-detail__version{background:#f3f7fb;color:#375166}
.org-detail__status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-detail__status.is-active{background:#eaf8ef;color:#166534}
.org-detail__status.is-inactive{background:#fff2f2;color:#b91c1c}
.org-detail__hero h2{margin:0;font-size:2rem;line-height:1.15;color:#11283f}
.org-detail__hero p{margin:0;color:#587083;line-height:1.7;max-width:72ch}
.org-detail__hero-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.org-detail__stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:1.2rem}
.org-detail__tabs{margin-top:1.3rem}
.org-detail__content-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:1rem;margin-top:1rem}
.org-detail__main-panel,.org-detail__sidebar{min-width:0}
.org-detail__info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.org-detail__info-card,.org-detail__quick-card{display:grid;gap:.35rem;padding:1rem 1.05rem;border-radius:22px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 38px rgba(15,23,42,.05)}
.org-detail__info-card small,.org-detail__quick-card small{color:#5f7587;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.org-detail__info-card strong,.org-detail__quick-card strong{color:#11283f;line-height:1.5}
.org-detail__sensitive-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem}
.org-detail__hint{margin:1rem 0 0;color:#5f7587;line-height:1.6}
.org-detail__empty{display:flex;flex-wrap:wrap;gap:.9rem;align-items:flex-start;padding:1rem 1.05rem;border-radius:22px;background:#f8fbff;color:#20415f}
.org-detail__empty p{margin:.28rem 0 0;color:#587083;line-height:1.6}
.org-detail__empty-action{margin-left:auto}
.org-detail__schools-preview{display:grid;gap:1rem}
.org-detail__schools-table-wrapper{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff;box-shadow:0 18px 36px rgba(15,23,42,.06)}
.org-detail__schools-table{width:100%;border-collapse:collapse;min-width:760px}
.org-detail__schools-table th,.org-detail__schools-table td{padding:1rem;text-align:left;border-bottom:1px solid rgba(17,40,63,.08);vertical-align:top}
.org-detail__schools-table th{background:#f8fbff;color:#486277;font-size:.82rem;text-transform:uppercase;letter-spacing:.04em}
.org-detail__schools-table tbody tr{transition:background-color .2s ease}
.org-detail__schools-table tbody tr:hover{background:#fbfdff}
.org-detail__preview-footer{display:flex;justify-content:flex-end}
.org-detail__timeline{display:grid;gap:1rem;margin:0;padding:0;list-style:none}
.org-detail__timeline-item{position:relative;display:grid;grid-template-columns:18px minmax(0,1fr);gap:1rem;align-items:flex-start}
.org-detail__timeline-item::before{content:'';position:absolute;left:8px;top:18px;bottom:-18px;width:2px;background:rgba(23,65,166,.12)}
.org-detail__timeline-item:last-child::before{display:none}
.org-detail__timeline-dot{width:18px;height:18px;border-radius:999px;background:#1741a6;box-shadow:0 0 0 5px rgba(23,65,166,.12)}
.org-detail__timeline-card{padding:1rem 1.05rem;border-radius:22px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 36px rgba(15,23,42,.06)}
.org-detail__timeline-meta{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.org-detail__timeline-card p{margin:.45rem 0;color:#587083;line-height:1.6}
.org-detail__timeline-card small{color:#6d8394}
.org-detail__quick-grid{display:grid;gap:.85rem}
.org-detail__sidebar-actions{display:grid;gap:.75rem;margin-top:1rem}

@media (max-width: 1080px){
  .org-detail__stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .org-detail__content-grid{grid-template-columns:1fr}
}

@media (max-width: 720px){
  .org-detail__actions,.org-detail__hero-actions,.org-detail__sensitive-actions{justify-content:stretch}
  .org-detail__button,.org-detail__button-link{width:100%}
  .org-detail__hero h2{font-size:1.6rem}
  .org-detail__info-grid{grid-template-columns:1fr}
  .org-detail__stats{grid-template-columns:1fr}
  .org-detail__empty-action{margin-left:0;width:100%}
  .org-detail__timeline-meta{flex-direction:column}
}
</style>
