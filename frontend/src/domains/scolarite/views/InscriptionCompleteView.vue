<template>
  <PageContainer>
    <PageHeader
      eyebrow="MS-01"
      title="Inscription scolaire complete"
      description="Centre de travail guide pour conduire le flux eleve -> famille -> inscription -> affectation dans le vrai perimetre du caissier."
    >
      <template #actions>
        <div class="scolarite-actions">
          <RouterLink class="scolarite-pill" to="/app/scolarite">
            <ArrowLeft />
            <span>Retour scolarite</span>
          </RouterLink>
          <RouterLink class="scolarite-pill" to="/app/scolarite/familles">
            <Users />
            <span>Ouvrir les familles</span>
          </RouterLink>
          <button class="scolarite-pill scolarite-pill--action" type="button" @click="prefillDemo">
            <Sparkles />
            <span>Pre-remplir</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre d inscription" description="Le workflow complet reste reserve au caissier dans la bonne ecole et la bonne annee scolaire.">
      <div class="scolarite-hero">
        <div class="scolarite-hero__lead">
          <div class="scolarite-hero__icon">
            <ShieldCheck />
          </div>
          <div>
            <h3>{{ context.schoolName }}</h3>
            <p>{{ perimeterMessage }}</p>
          </div>
        </div>
        <div class="scolarite-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="context.schoolYearLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="SCO-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Inscription non autorisee"
        message="Cette vue reste reservee au caissier actif dans la bonne ecole."
      />

      <template v-else>
        <SectionBlock title="Progression du flux" description="Le frontend rend visibles les etapes reelles du workflow sans couper l operation de bout en bout.">
          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorLabel }}</strong>
              <span>Mutation d inscription complete</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Etapes completees</small>
              <strong>{{ completedSteps }}/4</strong>
              <span>{{ completedStepsLabel }}</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Famille</small>
              <strong>{{ eleve.idFamille?.trim() ? 'Liee' : 'A renseigner ou creer' }}</strong>
              <span>Liaison via `idFamille` reelle</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Affectation</small>
              <strong>{{ hasAffectation ? 'Incluse' : 'Differee' }}</strong>
              <span>{{ hasAffectation ? 'Classe immediate demandee' : 'Inscription sans affectation immediate' }}</span>
            </div>
          </div>

          <div class="scolarite-step-grid">
            <article class="scolarite-step-card" :class="{ 'scolarite-step-card--done': isEleveStepComplete }">
              <small>Etape 1</small>
              <strong>Identite eleve</strong>
              <span>Identifiant, identite, provenance et informations civiles.</span>
            </article>
            <article class="scolarite-step-card" :class="{ 'scolarite-step-card--done': isFamilleStepComplete }">
              <small>Etape 2</small>
              <strong>Famille</strong>
              <span>Liaison a une famille existante ou ouverture de `MS-03` pour creation.</span>
            </article>
            <article class="scolarite-step-card" :class="{ 'scolarite-step-card--done': isInscriptionStepComplete }">
              <small>Etape 3</small>
              <strong>Inscription annuelle</strong>
              <span>Annee, origine et date d inscription.</span>
            </article>
            <article class="scolarite-step-card" :class="{ 'scolarite-step-card--done': isAffectationStepComplete }">
              <small>Etape 4</small>
              <strong>Affectation</strong>
              <span>Optionnelle, uniquement si la classe cible est deja connue.</span>
            </article>
          </div>
        </SectionBlock>

        <SectionBlock title="Assistant de parcours" description="Chaque bloc correspond a un segment backend reel du workflow SCO-01.">
          <div class="scolarite-form-stack">
            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Identite eleve</h3>
                  <p>Creation ou reprise de l eleve avant l inscription annuelle.</p>
                </div>
                <span class="status-chip" :class="isEleveStepComplete ? 'status-chip--ok' : 'status-chip--neutral'">
                  {{ isEleveStepComplete ? 'Pret' : 'Incomplet' }}
                </span>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id eleve</span>
                  <input v-model="eleve.idEleve" type="text" placeholder="eleve-uuid" />
                </label>
                <label class="scolarite-field">
                  <span>Matricule</span>
                  <input v-model="eleve.matricule" type="text" placeholder="EL-2026-001" />
                </label>
                <label class="scolarite-field">
                  <span>Nom</span>
                  <input v-model="eleve.nom" type="text" placeholder="Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Postnom</span>
                  <input v-model="eleve.postNom" type="text" placeholder="Kalala" />
                </label>
                <label class="scolarite-field">
                  <span>Prenom</span>
                  <input v-model="eleve.prenom" type="text" placeholder="Sarah" />
                </label>
                <label class="scolarite-field">
                  <span>Sexe</span>
                  <select v-model="eleve.sexe">
                    <option value="F">F</option>
                    <option value="M">M</option>
                  </select>
                </label>
                <label class="scolarite-field">
                  <span>Date de naissance</span>
                  <input v-model="eleve.dateNaissance" type="date" />
                </label>
                <label class="scolarite-field">
                  <span>Lieu de naissance</span>
                  <input v-model="eleve.lieuNaissance" type="text" placeholder="Lubumbashi" />
                </label>
                <label class="scolarite-field">
                  <span>Nationalite</span>
                  <input v-model="eleve.nationalite" type="text" placeholder="Congolaise" />
                </label>
                <label class="scolarite-field">
                  <span>Type provenance</span>
                  <select v-model="eleve.typeProvenance">
                    <option value="EXTERNE">EXTERNE</option>
                    <option value="INTERNE">INTERNE</option>
                  </select>
                </label>
                <label class="scolarite-field scolarite-field--full">
                  <span>Ecole provenance</span>
                  <input v-model="eleve.nomEcoleProvenance" type="text" placeholder="Institut source" />
                </label>
              </div>
            </div>

            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Famille et rattachement</h3>
                  <p>Le backend actuel supporte la liaison `idFamille` dans le flux complet. La creation de famille se fait dans `MS-03` si necessaire.</p>
                </div>
                <span class="status-chip" :class="isFamilleStepComplete ? 'status-chip--ok' : 'status-chip--neutral'">
                  {{ isFamilleStepComplete ? 'Liee' : 'Libre' }}
                </span>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id famille</span>
                  <input v-model="eleve.idFamille" type="text" placeholder="optionnel" />
                </label>
              </div>
              <div class="scolarite-inline-note">
                <Users />
                <span>Si la famille n existe pas encore, ouvrez la vue des familles, creez-la, puis revenez ici lier son identifiant.</span>
              </div>
            </div>

            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Inscription annuelle</h3>
                  <p>Bloc obligatoire pour ouvrir l inscription sur l annee scolaire cible.</p>
                </div>
                <span class="status-chip" :class="isInscriptionStepComplete ? 'status-chip--ok' : 'status-chip--neutral'">
                  {{ isInscriptionStepComplete ? 'Prete' : 'Incomplete' }}
                </span>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id inscription</span>
                  <input v-model="inscription.idInscriptionScolaire" type="text" placeholder="inscription-uuid" />
                </label>
                <div class="scolarite-context-card">
                  <small>Annee scolaire active</small>
                  <strong>{{ context.schoolYearLabel || 'A charger dans ACA-03' }}</strong>
                  <span>{{ context.schoolYearId || 'Identifiant non resolu' }}</span>
                </div>
                <label class="scolarite-field">
                  <span>Date inscription</span>
                  <input v-model="inscription.dateInscription" type="date" />
                </label>
                <label class="scolarite-field">
                  <span>Origine inscription</span>
                  <select v-model="inscription.origineInscription">
                    <option value="NOUVEAU">NOUVEAU</option>
                    <option value="ANCIEN">ANCIEN</option>
                    <option value="TRANSFERE_ENTRANT">TRANSFERE_ENTRANT</option>
                    <option value="REINTEGRE">REINTEGRE</option>
                  </select>
                </label>
                <label class="scolarite-field">
                  <span>Numero ordre</span>
                  <input v-model="inscription.numeroOrdre" type="text" placeholder="optionnel" />
                </label>
                <label class="scolarite-field scolarite-field--full">
                  <span>Observation</span>
                  <input v-model="inscription.observation" type="text" placeholder="optionnel" />
                </label>
              </div>
            </div>

            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Affectation immediate</h3>
                  <p>Optionnelle. Activez-la seulement si la classe pedagogique cible est deja connue.</p>
                </div>
                <label class="scolarite-toggle">
                  <input v-model="hasAffectation" type="checkbox" />
                  <span>Inclure l affectation</span>
                </label>
              </div>

              <div v-if="hasAffectation" class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id affectation</span>
                  <input v-model="affectation.idAffectationClasse" type="text" placeholder="affectation-uuid" />
                </label>
                <label class="scolarite-field">
                  <span>Id classe pedagogique</span>
                  <input v-model="affectation.idClassePedagogique" type="text" placeholder="classe-uuid" />
                </label>
                <label class="scolarite-field">
                  <span>Date affectation</span>
                  <input v-model="affectation.dateAffectation" type="date" />
                </label>
                <label class="scolarite-field scolarite-field--full">
                  <span>Motif affectation</span>
                  <input v-model="affectation.motifAffectation" type="text" placeholder="optionnel" />
                </label>
              </div>

              <div v-else class="scolarite-inline-note">
                <AlertCircle />
                <span>L inscription sera enregistree sans affectation immediate. La classe pourra etre ouverte plus tard via `MS-04`.</span>
              </div>
            </div>

            <div class="scolarite-actions-row">
              <button v-if="canWriteEnrollment" class="scolarite-primary-action" type="button" :disabled="!canSubmit" @click="soumettre">
                <Save />
                <span>Enregistrer l inscription complete</span>
              </button>
              <button class="scolarite-secondary-action" type="button" @click="reinitialiserFormulaire">
                Reinitialiser
              </button>
            </div>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Inscription en cours"
          message="Le backend valide l eleve, l inscription et l affectation eventuelle."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Inscription impossible"
          :message="store.state.errorMessage ?? 'Le workflow n a pas abouti.'"
        />
        <SectionBlock
          v-else-if="store.state.result"
          title="Recapitulatif final"
          description="Le flux complet est traite comme une seule operation de scolarite, sans couture manuelle intermediaire."
        >
          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card">
              <small>Eleve</small>
              <strong>{{ store.state.result.idEleve }}</strong>
              <span>Creation / rattachement valide</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Inscription</small>
              <strong>{{ store.state.result.idInscriptionScolaire }}</strong>
              <span>{{ store.state.result.statutInscription }}</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Affectation</small>
              <strong>{{ store.state.result.idAffectationClasse ?? 'Aucune' }}</strong>
              <span>{{ store.state.result.classe ?? 'Aucune classe cible retournee' }}</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Suite logique</small>
              <strong>{{ store.state.result.idAffectationClasse ? 'Eleve affecte' : 'Affectation a poursuivre' }}</strong>
              <span>{{ store.state.result.idAffectationClasse ? 'Flux boucle' : 'Continuer via MS-04 si necessaire' }}</span>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          v-if="store.state.result"
          title="Etapes suivantes"
          description="Le parcours reel peut maintenant continuer sans ressaisie manuelle vers les centres de travail suivants."
        >
          <div class="scolarite-next-grid">
            <button class="scolarite-next-card" type="button" @click="ouvrirFamilles">
              <strong>Revenir aux familles</strong>
              <small>Relire ou completer la famille rattachee a l eleve inscrit.</small>
            </button>
            <button class="scolarite-next-card" type="button" @click="ouvrirEleves">
              <strong>Ouvrir les eleves</strong>
              <small>Verifier immediatement la fiche eleve dans la liste scolaire.</small>
            </button>
            <button class="scolarite-next-card" type="button" @click="ouvrirAffectations">
              <strong>{{ store.state.result.idAffectationClasse ? 'Relire l affectation' : 'Terminer l affectation' }}</strong>
              <small>{{ store.state.result.idAffectationClasse ? 'Le centre MS-04 peut relire ou ajuster la classe.' : 'Le centre MS-04 permet de finaliser la classe si elle n a pas ete posee.' }}</small>
            </button>
            <button class="scolarite-next-card" type="button" @click="ouvrirPaiement">
              <strong>Continuer vers le paiement</strong>
              <small>Passer directement a la perception financiere dans le meme contexte ecole.</small>
            </button>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import {
  ArrowLeft,
  CheckCircle2,
  CircleCheckBig,
  CreditCard,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { useCompleteEnrollmentViewModel } from '../viewmodels/useCompleteEnrollmentViewModel';

const {
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
} = useCompleteEnrollmentViewModel();
</script>

<style src="./InscriptionCompleteView.css" scoped></style>
