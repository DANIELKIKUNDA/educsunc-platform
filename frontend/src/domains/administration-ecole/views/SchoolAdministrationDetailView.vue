<template>
  <PageContainer>
    <PageHeader
      eyebrow="ADM-02"
      title="Fiche structurelle d une ecole"
      description="Consultation, identite institutionnelle et cycle de vie d une ecole dans le cadre strict de ADM-01."
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
      :message="store.state.errorMessage ?? 'La fiche structurelle de cette ecole ne peut pas etre ouverte.'"
    />
    <EmptyState
      v-else-if="!school"
      title="Aucune ecole chargee"
      message="Le detail attend un identifiant d ecole valide pour relire la fiche backend."
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
        title="Derniere mutation"
        description="Le backend a bien confirme la derniere operation structurelle."
      >
        <div class="school-admin__banner">{{ store.state.lastMutationMessage }}</div>
      </SectionBlock>

      <SectionBlock
        title="Identite institutionnelle"
        description="Lecture complete des champs reels exposes par le backend pour l ecole selectionnee."
      >
        <div class="school-admin__identity-grid">
          <article class="school-admin__identity-card">
            <header>
              <h3>Presentation</h3>
              <p>Vue de lecture structurelle sans ajout de capacites non prouvees.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Nom</span><strong>{{ school.nom }}</strong></div>
              <div class="school-admin__trace-item"><span>Code</span><strong>{{ school.code }}</strong></div>
              <div class="school-admin__trace-item"><span>Sigle</span><strong>{{ school.sigle || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Mode</span><strong><SchoolModeBadge :mode="school.modeExploitation" /></strong></div>
              <div class="school-admin__trace-item"><span>Statut</span><strong><SchoolStatusBadge :active="school.actif" /></strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Coordonnees</h3>
              <p>Les informations institutionnelles peuvent etre mises a jour si `referentiel.write` est reellement ouvert.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Telephone</span><strong>{{ school.telephone || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Email</span><strong>{{ school.email || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Adresse</span><strong>{{ school.adresse || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Province educationnelle</span><strong>{{ school.provinceEducationnelle || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Ville</span><strong>{{ school.ville || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Commune / territoire</span><strong>{{ school.communeOuTerritoire || '-' }}</strong></div>
            </div>
          </article>

          <article class="school-admin__identity-card">
            <header>
              <h3>Trace structurelle</h3>
              <p>Historique direct expose par le DTO actuel, sans reconstruction artificielle.</p>
            </header>
            <div class="school-admin__trace-list">
              <div class="school-admin__trace-item"><span>Organisation</span><strong>{{ school.idOrganisation }}</strong></div>
              <div class="school-admin__trace-item"><span>Cree le</span><strong>{{ school.creeLe }}</strong></div>
              <div class="school-admin__trace-item"><span>Cree par</span><strong>{{ school.creePar || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Modifie le</span><strong>{{ school.modifieLe || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Modifie par</span><strong>{{ school.modifiePar || '-' }}</strong></div>
              <div class="school-admin__trace-item"><span>Version</span><strong>{{ school.version }}</strong></div>
            </div>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        v-if="canMutateDetail"
        title="Mutations structurelles autorisees"
        description="Cette fiche reste volontairement limitee aux mutations prouvees: renommage, mode, identite institutionnelle, activation et desactivation."
      >
        <div class="school-admin__detail-grid">
          <article class="school-admin__mutations-card">
            <header>
              <h3>Renommer l ecole</h3>
              <p>Le backend applique le nouveau nom puis conserve la tracabilite.</p>
            </header>
            <form @submit.prevent="renameSchool">
              <div class="school-admin__field">
                <span>Nouveau nom</span>
                <input v-model="renameTarget" type="text" placeholder="Nouveau nom officiel" />
              </div>
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="!renameTarget.trim() || store.state.mutationStatus === 'loading'"
                >
                  Renommer
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Changer le mode d exploitation</h3>
              <p>Les seules valeurs exposees proviennent de l enumeration backend.</p>
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
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="store.state.mutationStatus === 'loading'"
                >
                  Mettre a jour le mode
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Mettre a jour l identite institutionnelle</h3>
              <p>Les champs exposes correspondent exactement au DTO et a la route de mutation prouvee.</p>
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
              <div class="school-admin__actions">
                <button
                  class="school-admin__pill-button school-admin__pill-button--primary"
                  type="submit"
                  :disabled="store.state.mutationStatus === 'loading'"
                >
                  Enregistrer l identite
                </button>
              </div>
            </form>
          </article>

          <article class="school-admin__mutations-card">
            <header>
              <h3>Cycle de vie</h3>
              <p>L ecole reste visible dans le registre, mais son statut structurel peut etre modifie avec confirmation.</p>
            </header>
            <div class="school-admin__actions">
              <button
                class="school-admin__pill-button school-admin__pill-button--primary"
                type="button"
                :disabled="school.actif || store.state.mutationStatus === 'loading'"
                @click="openLifecycleModal('activate')"
              >
                Activer l ecole
              </button>
              <button
                class="school-admin__pill-button"
                type="button"
                :disabled="!school.actif || store.state.mutationStatus === 'loading'"
                @click="openLifecycleModal('deactivate')"
              >
                Desactiver l ecole
              </button>
            </div>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        v-else
        title="Lecture seule"
        description="Le detail reste ouvert, mais ce profil ne peut pas muter l existence ni l identite de l ecole."
      >
        <div class="school-admin__banner school-admin__banner--muted">
          La fiche respecte le backend actuel: lecture structurelle oui, mutations non.
        </div>
      </SectionBlock>

      <SectionBlock
        title="Projection future"
        description="Cette fiche constitue un point d entree vers le futur niveau Ecole, sans deja ouvrir ses workflows d exploitation."
      >
        <div class="school-admin__placeholder-card">
          <p>
            Le niveau Ecole sera branche plus tard. Cette vue reste volontairement limitee a l existence et a l identite structurelle de l ecole.
          </p>
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
  canMutateDetail,
  renameTarget,
  identityForm,
  schoolModeOptions,
  summaryCards,
  lifecycleModalOpen,
  lifecycleAction,
  renameSchool,
  updateMode,
  updateInstitutionalInfo,
  openLifecycleModal,
  closeLifecycleModal,
  confirmLifecycle,
} = useSchoolAdministrationDetailViewModel();
</script>

<style src="../school-administration.css"></style>
