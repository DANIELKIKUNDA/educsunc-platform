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
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  AlertCircle,
  ArrowLeft,
  Save,
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
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useEnrollmentStore } from '../stores/enrollment.store';

const store = useEnrollmentStore();
const session = sessionStore.state;
const context = activeContextStore.state;
const doctrineAccess = useDoctrineAccess();
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
</script>

<style scoped>
.scolarite-actions,.scolarite-actions-row,.scolarite-subsection__header{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}
.scolarite-pill,.scolarite-primary-action,.scolarite-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.scolarite-pill--action,.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-primary-action:disabled{opacity:.55;cursor:not-allowed}
.scolarite-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.scolarite-hero__lead{display:flex;align-items:center;gap:1rem}
.scolarite-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.scolarite-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.scolarite-form-stack{display:grid;gap:1rem}
.scolarite-subsection{border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(243,248,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem;display:grid;gap:1rem}
.scolarite-grid,.scolarite-kpi-grid,.scolarite-step-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.scolarite-context-card{border-radius:18px;border:1px solid rgba(17,40,63,.08);background:#f4f8fb;padding:1rem;display:grid;gap:.35rem;align-content:start}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field--full{grid-column:1/-1}
.scolarite-field input,.scolarite-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-kpi-card,.scolarite-step-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.scolarite-step-card--done{background:linear-gradient(180deg,#ecf9f2,#ffffff);border-color:rgba(22,101,52,.16)}
.scolarite-inline-note{display:flex;gap:.75rem;align-items:flex-start;border-radius:18px;background:#f7fbfd;padding:.9rem 1rem;color:#456175}
.scolarite-toggle{display:inline-flex;gap:.5rem;align-items:center}
.status-chip{display:inline-flex;align-items:center;border-radius:999px;padding:.2rem .65rem;font-size:.82rem;font-weight:600}
.status-chip--ok{background:#e7f6ee;color:#166534}
.status-chip--neutral{background:#edf4f8;color:#365066}
@media (max-width: 900px){
  .scolarite-hero{flex-direction:column}
  .scolarite-hero__lead{align-items:flex-start}
}
</style>
