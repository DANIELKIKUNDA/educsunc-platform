<template>
  <PageContainer>
    <PageHeader
      eyebrow="Administration ecole"
      title="Fiche ecole"
      description="Consultez l'identite de l'etablissement, ses coordonnees et ses actions administratives autorisees."
    >
      <template #actions>
        <div class="school-admin__hero-actions">
          <RouterLink class="school-admin__hero-link" to="/app/administration-ecole/ecoles">
            Retour au registre
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <div v-if="store.state.status === 'loading'" class="school-admin__skeleton-grid">
      <div v-for="index in 4" :key="index" class="school-admin__skeleton-card" />
    </div>
    <ErrorState
      v-else-if="store.state.status === 'error'"
      title="Fiche indisponible"
      :message="store.state.errorMessage ?? 'La fiche de cette ecole ne peut pas etre ouverte.'"
    />
    <EmptyState
      v-else-if="!school"
      title="Aucune ecole disponible"
      message="Retournez au registre pour ouvrir la fiche d'un etablissement."
    />

    <template v-else>
      <section class="school-admin__stat-grid">
        <StatCard
          v-for="card in summaryCards"
          :key="card.label"
          :icon="card.icon"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :tone="card.tone"
        />
      </section>

      <SectionBlock
        v-if="store.state.lastMutationMessage"
        title="Derniere action"
        description="Cette confirmation provient de la derniere operation reussie."
      >
        <div class="school-admin__banner">{{ store.state.lastMutationMessage }}</div>
      </SectionBlock>

      <SectionBlock
        title="Identite et coordonnees"
        description="La fiche est organisee par informations metier pour faciliter la lecture et les mises a jour."
      >
        <div class="school-admin__identity-grid">
          <article class="school-admin__identity-card">
            <header>
              <h3>Identite</h3>
              <p>Informations principales de l'etablissement.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Nom</span><strong>{{ school.nom }}</strong></div>
              <div class="school-admin__trace-item"><span>Code</span><strong>{{ school.code }}</strong></div>
              <div class="school-admin__trace-item"><span>Sigle</span><strong>{{ school.sigle || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Organisation</span><strong>{{ organization?.nom || 'Information non disponible' }}</strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Coordonnees</h3>
              <p>Coordonnees administratives et contact de l'etablissement.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Telephone</span><strong>{{ school.telephone || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Email</span><strong>{{ school.email || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Adresse</span><strong>{{ school.adresse || '-' }}</strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Localisation</h3>
              <p>Elements geographiques utiles a l'identification de l'ecole.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Province educationnelle</span><strong>{{ school.provinceEducationnelle || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Ville</span><strong>{{ school.ville || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Commune / territoire</span><strong>{{ school.communeOuTerritoire || '-' }}</strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Mode et statut</h3>
              <p>Situation actuelle de l'ecole dans le registre administratif.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Mode d'exploitation</span><strong><SchoolModeBadge :mode="school.modeExploitation" /></strong></div>
              <div class="school-admin__trace-item"><span>Statut</span><strong><SchoolStatusBadge :active="school.actif" /></strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Tracabilite</h3>
              <p>Repere de creation et de derniere mise a jour relus depuis le backend.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Cree le</span><strong>{{ formatDate(school.creeLe) }}</strong></div>
              <div class="school-admin__trace-item"><span>Cree par</span><strong>{{ school.creePar || 'Information non disponible' }}</strong></div>
              <div class="school-admin__trace-item"><span>Derniere modification</span><strong>{{ formatDate(school.modifieLe) }}</strong></div>
              <div class="school-admin__trace-item"><span>Modifie par</span><strong>{{ school.modifiePar || 'Information non disponible' }}</strong></div>
              <div class="school-admin__trace-item"><span>Version</span><strong>{{ school.version }}</strong></div>
            </div>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        v-if="canMutateDetail"
        title="Actions disponibles"
        description="Seules les mutations reelles du backend sont exposees ici."
      >
        <div class="school-admin__detail-grid">
          <article class="school-admin__mutations-card">
            <header>
              <h3>Renommer l'ecole</h3>
              <p>Utilisez un nouveau nom officiel. La trace de la modification restera visible dans la fiche.</p>
            </header>
            <form @submit.prevent="renameSchool">
              <div class="school-admin__field">
                <span>Nouveau nom</span>
                <input v-model="renameTarget" type="text" placeholder="Nouveau nom officiel" />
              </div>
              <div class="school-admin__helper">{{ renameEvaluation.disableReason ?? "Le nouveau nom sera applique apres validation du backend." }}</div>
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="!renameEvaluation.canSubmit"
                >
                  Renommer
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Changer le mode d'exploitation</h3>
              <p>Selectionnez un autre mode parmi les valeurs officiellement reconnues.</p>
            </header>
            <form @submit.prevent="updateMode">
              <div class="school-admin__field">
                <span>Mode cible</span>
                <select v-model="identityForm.modeExploitation">
                  <option v-for="option in schoolModeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="school-admin__helper">
                {{ schoolModeOptions.find((option) => option.value === identityForm.modeExploitation)?.description }}
              </div>
              <div class="school-admin__helper">{{ modeEvaluation.disableReason ?? "Le nouveau mode sera applique apres validation." }}</div>
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="!modeEvaluation.canSubmit"
                >
                  Enregistrer le mode
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Modifier les informations institutionnelles</h3>
              <p>Mettez a jour les coordonnees administratives de l'etablissement sans perdre votre brouillon en cas d'erreur.</p>
            </header>
            <form @submit.prevent="updateInstitutionalInfo">
              <div class="school-admin__form-grid">
                <div class="school-admin__field">
                  <span>Sigle</span>
                  <input v-model="identityForm.sigle" type="text" placeholder="CSR" />
                </div>
                <div class="school-admin__field">
                  <span>Telephone</span>
                  <input v-model="identityForm.telephone" type="text" placeholder="+243..." />
                </div>
                <div class="school-admin__field">
                  <span>Email</span>
                  <input v-model="identityForm.email" type="email" placeholder="contact@ecole.cd" />
                </div>
                <div class="school-admin__field">
                  <span>Province educationnelle</span>
                  <input v-model="identityForm.provinceEducationnelle" type="text" placeholder="Haut-Katanga 1" />
                </div>
                <div class="school-admin__field">
                  <span>Ville</span>
                  <input v-model="identityForm.ville" type="text" placeholder="Lubumbashi" />
                </div>
                <div class="school-admin__field">
                  <span>Commune / territoire</span>
                  <input v-model="identityForm.communeOuTerritoire" type="text" placeholder="Kampemba" />
                </div>
                <div class="school-admin__field school-admin__field--wide">
                  <span>Adresse</span>
                  <input v-model="identityForm.adresse" type="text" placeholder="Adresse institutionnelle" />
                </div>
              </div>
              <div class="school-admin__helper">{{ identityEvaluation.disableReason ?? "Les champs modifies seront relus apres confirmation du backend." }}</div>
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="!identityEvaluation.canSubmit"
                >
                  Enregistrer les informations
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Cycle de vie</h3>
              <p>L'ecole reste visible dans le registre, mais son statut peut etre modifie avec confirmation.</p>
            </header>
            <div class="school-admin__actions">
              <button
                class="school-admin__pill-button school-admin__pill-button--primary"
                type="button"
                :disabled="school.actif || store.state.mutationStatus === 'loading'"
                @click="openLifecycleModal('activate')"
              >
                Activer l'ecole
              </button>
              <button
                class="school-admin__pill-button"
                type="button"
                :disabled="!school.actif || store.state.mutationStatus === 'loading'"
                @click="openLifecycleModal('deactivate')"
              >
                Desactiver l'ecole
              </button>
            </div>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        v-else
        title="Lecture seule"
        description="La fiche reste consultable, mais les modifications ne sont pas autorisees pour ce profil."
      >
        <div class="school-admin__banner school-admin__banner--muted">
          Vous pouvez consulter cette ecole, sans modifier son nom, ses informations ni son statut.
        </div>
      </SectionBlock>

      <SchoolLifecycleModal
        :open="lifecycleModalOpen"
        :action="lifecycleAction"
        :school-name="school.nom"
        :pending="store.state.mutationStatus === 'loading'"
        @close="closeLifecycleModal"
        @confirm="confirmLifecycle"
      />
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import SchoolLifecycleModal from '../components/SchoolLifecycleModal.vue';
import SchoolModeBadge from '../components/SchoolModeBadge.vue';
import SchoolStatusBadge from '../components/SchoolStatusBadge.vue';
import { useSchoolAdministrationDetailViewModel } from '../viewmodels/useSchoolAdministrationDetailViewModel';

const {
  store,
  school,
  organization,
  canMutateDetail,
  renameTarget,
  identityForm,
  schoolModeOptions,
  summaryCards,
  renameEvaluation,
  modeEvaluation,
  identityEvaluation,
  lifecycleModalOpen,
  lifecycleAction,
  formatDate,
  renameSchool,
  updateMode,
  updateInstitutionalInfo,
  openLifecycleModal,
  closeLifecycleModal,
  confirmLifecycle,
} = useSchoolAdministrationDetailViewModel();
</script>

<style src="../school-administration.css"></style>
