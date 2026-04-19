<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Eye,
  FileCheck2,
  FileClock,
  FileUp,
  History,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
} from 'lucide-vue-next';

const operationsSensibles = [
  {
    code: 'IMPORT-REF',
    operation: 'Importer un référentiel officiel',
    portee: 'Sections, options, classes, cours',
    statut: 'Prêt',
    confirmation: 'Requise',
    dernierPassage: '14 avr. 2026',
  },
  {
    code: 'PUB-VERSION',
    operation: 'Publier une version de référentiel',
    portee: 'Version officielle',
    statut: 'À vérifier',
    confirmation: 'Double validation',
    dernierPassage: '12 avr. 2026',
  },
  {
    code: 'MIG-PROG',
    operation: 'Migrer les programmes niveau',
    portee: 'Classes et programmes locaux',
    statut: 'Planifié',
    confirmation: 'Requise',
    dernierPassage: 'Jamais',
  },
  {
    code: 'CACHE-REF',
    operation: 'Reconstruire le cache référentiel',
    portee: 'Lecture école',
    statut: 'Prêt',
    confirmation: 'Simple',
    dernierPassage: '15 avr. 2026',
  },
];

const importsRecents = [
  { fichier: 'sections-scolaires.v1.json', type: 'Sections', statut: 'Terminé', lignes: 3 },
  { fichier: 'options-etudes.v1.json', type: 'Options', statut: 'Terminé', lignes: 42 },
  { fichier: 'classes-academiques.v1.json', type: 'Classes', statut: 'Terminé', lignes: 177 },
  { fichier: 'programmes-academiques.v1.json', type: 'Programmes', statut: 'En attente', lignes: 0 },
];

const journalAudit = [
  { date: '15 avr. 2026', action: 'Cache référentiel reconstruit', acteur: 'Admin principal', resultat: 'Succès' },
  { date: '14 avr. 2026', action: 'Options importées', acteur: 'Admin principal', resultat: 'Succès' },
  { date: '12 avr. 2026', action: 'Publication contrôlée', acteur: 'Admin principal', resultat: 'À revoir' },
];
</script>

<template>
  <section class="maintenance-page">
    <header class="maintenance-hero">
      <div>
        <span class="maintenance-hero__eyebrow">Maintenance sécurisée</span>
        <h2>Migrations référentiel</h2>
        <p>Contrôle des imports, publications, migrations et opérations sensibles du référentiel académique.</p>
      </div>

      <div class="maintenance-hero__actions">
        <button class="bouton bouton--principal" type="button">
          <UploadCloud :size="18" />
          Nouvel import
        </button>
        <button class="bouton" type="button">
          <RefreshCw :size="18" />
          Recontrôler
        </button>
      </div>
    </header>

    <section class="indicateurs" aria-label="Indicateurs de maintenance référentiel">
      <article class="indicateur indicateur--principal">
        <div class="indicateur__icone">
          <ShieldAlert :size="24" />
        </div>
        <div>
          <span>Zone sensible</span>
          <strong>Contrôlée</strong>
          <p>Aucune exécution sans confirmation explicite.</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--bleu">
          <FileUp :size="22" />
        </div>
        <div>
          <span>Imports</span>
          <strong>3 terminés</strong>
          <p>Données de référence chargées</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <DatabaseZap :size="22" />
        </div>
        <div>
          <span>Migrations</span>
          <strong>1 planifiée</strong>
          <p>Validation requise avant exécution</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <LockKeyhole :size="22" />
        </div>
        <div>
          <span>Confirmations</span>
          <strong>Actives</strong>
          <p>Actions critiques protégées</p>
        </div>
      </article>
    </section>

    <section class="barre-outils" aria-label="Filtres de maintenance référentiel">
      <label class="champ-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher une opération, un import ou un audit..." />
      </label>

      <button class="bouton-filtre" type="button">
        <SlidersHorizontal :size="18" />
        Filtres
      </button>

      <div class="badge-securite">
        <ShieldCheck :size="18" />
        Mode sécurisé
      </div>
    </section>

    <section class="grille-maintenance">
      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Opérations</span>
            <h3>Actions sensibles</h3>
          </div>
          <DatabaseZap :size="22" />
        </div>

        <div class="tableau-maintenance tableau-maintenance--operations">
          <div class="tableau-maintenance__ligne tableau-maintenance__ligne--entete">
            <span>Code</span>
            <span>Opération</span>
            <span>Portée</span>
            <span>Statut</span>
            <span>Confirmation</span>
            <span>Dernier passage</span>
            <span>Action</span>
          </div>

          <div
            v-for="operation in operationsSensibles"
            :key="operation.code"
            class="tableau-maintenance__ligne"
          >
            <strong>{{ operation.code }}</strong>
            <span>{{ operation.operation }}</span>
            <span>{{ operation.portee }}</span>
            <span>
              <span
                class="badge"
                :class="{
                  'badge--vert': operation.statut === 'Prêt',
                  'badge--orange': operation.statut === 'À vérifier' || operation.statut === 'Planifié',
                }"
              >
                {{ operation.statut }}
              </span>
            </span>
            <span>{{ operation.confirmation }}</span>
            <span>{{ operation.dernierPassage }}</span>
            <button class="bouton-icone" type="button" aria-label="Consulter l’opération">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="carte-focus">
        <div class="carte-focus__entete">
          <div>
            <span>Garde-fou</span>
            <h3>Avant exécution</h3>
          </div>
          <AlertTriangle :size="24" />
        </div>

        <div class="checklist-securite">
          <div>
            <CheckCircle2 :size="18" />
            <span>Vérifier la version source</span>
          </div>
          <div>
            <CheckCircle2 :size="18" />
            <span>Contrôler l’année active</span>
          </div>
          <div>
            <Clock3 :size="18" />
            <span>Demander confirmation explicite</span>
          </div>
          <div>
            <FileCheck2 :size="18" />
            <span>Tracer le résultat dans l’audit</span>
          </div>
        </div>
      </article>

      <article class="carte-tableau">
        <div class="carte-tableau__entete">
          <div>
            <span>Imports</span>
            <h3>Files récentes</h3>
          </div>
          <FileClock :size="22" />
        </div>

        <div class="tableau-maintenance tableau-maintenance--imports">
          <div class="tableau-maintenance__ligne tableau-maintenance__ligne--entete">
            <span>Fichier</span>
            <span>Type</span>
            <span>Lignes</span>
            <span>Statut</span>
          </div>

          <div v-for="importRecent in importsRecents" :key="importRecent.fichier" class="tableau-maintenance__ligne">
            <strong>{{ importRecent.fichier }}</strong>
            <span>{{ importRecent.type }}</span>
            <span>{{ importRecent.lignes }}</span>
            <span>
              <span class="badge" :class="importRecent.statut === 'Terminé' ? 'badge--vert' : 'badge--orange'">
                {{ importRecent.statut }}
              </span>
            </span>
          </div>
        </div>
      </article>

      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Audit</span>
            <h3>Journal de maintenance</h3>
          </div>
          <History :size="22" />
        </div>

        <div class="tableau-maintenance tableau-maintenance--audit">
          <div class="tableau-maintenance__ligne tableau-maintenance__ligne--entete">
            <span>Date</span>
            <span>Action</span>
            <span>Acteur</span>
            <span>Résultat</span>
          </div>

          <div v-for="audit in journalAudit" :key="`${audit.date}-${audit.action}`" class="tableau-maintenance__ligne">
            <strong>{{ audit.date }}</strong>
            <span>{{ audit.action }}</span>
            <span>{{ audit.acteur }}</span>
            <span>
              <span class="badge" :class="audit.resultat === 'Succès' ? 'badge--vert' : 'badge--orange'">
                {{ audit.resultat }}
              </span>
            </span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.maintenance-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.maintenance-hero,
.indicateur,
.barre-outils,
.carte-tableau,
.carte-focus {
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.maintenance-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem;
  border-radius: 1rem;
  background:
    radial-gradient(circle at top right, rgba(217, 75, 75, 0.12), transparent 20rem),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
}

.maintenance-hero__eyebrow,
.indicateur span,
.carte-tableau__entete span,
.carte-focus__entete span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.maintenance-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.maintenance-hero p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.maintenance-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.bouton,
.bouton-filtre {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.45rem;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 850;
}

.bouton--principal {
  border-color: #9a3b3b;
  background: #9a3b3b;
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(154, 59, 59, 0.2);
}

.indicateurs {
  display: grid;
  grid-template-columns: 1.35fr repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.indicateur {
  display: flex;
  min-height: 7.1rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.85rem;
}

.indicateur--principal {
  background: linear-gradient(135deg, #7f3030 0%, #b64a4a 100%);
  color: #ffffff;
}

.indicateur--principal span,
.indicateur--principal strong,
.indicateur--principal p {
  color: #ffffff;
}

.indicateur__icone {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.indicateur__icone--bleu {
  background: var(--couleur-principale);
}

.indicateur__icone--orange {
  background: #e5a324;
}

.indicateur__icone--vert {
  background: var(--couleur-succes);
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: var(--couleur-encre);
  font-size: 1.15rem;
}

.indicateur p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.45;
}

.barre-outils {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 0.9rem;
}

.champ-recherche {
  display: flex;
  min-height: 2.8rem;
  flex: 1;
  align-items: center;
  gap: 0.65rem;
  padding: 0 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #fbfcfe;
  color: var(--couleur-texte-douce);
}

.champ-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--couleur-encre);
}

.badge-securite {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 0.85rem;
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.grille-maintenance {
  display: grid;
  grid-template-columns: 0.78fr 1.22fr;
  gap: 0.85rem;
}

.carte-tableau,
.carte-focus {
  overflow: hidden;
  border-radius: 1rem;
}

.carte-tableau--large {
  grid-column: span 2;
}

.carte-tableau__entete,
.carte-focus__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.carte-tableau__entete h3,
.carte-focus__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.carte-tableau__entete svg,
.carte-focus__entete svg {
  color: #9a3b3b;
}

.tableau-maintenance {
  display: grid;
  overflow-x: auto;
}

.tableau-maintenance__ligne {
  display: grid;
  align-items: center;
  gap: 0.8rem;
  min-width: 980px;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: var(--couleur-texte);
}

.tableau-maintenance__ligne:last-child {
  border-bottom: 0;
}

.tableau-maintenance__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-maintenance__ligne strong {
  color: var(--couleur-encre);
}

.tableau-maintenance--operations .tableau-maintenance__ligne {
  grid-template-columns: 0.8fr 1.75fr 1.45fr 0.9fr 1.1fr 1fr 0.45fr;
}

.tableau-maintenance--imports .tableau-maintenance__ligne {
  min-width: 720px;
  grid-template-columns: 1.8fr 0.9fr 0.6fr 0.85fr;
}

.tableau-maintenance--audit .tableau-maintenance__ligne {
  min-width: 760px;
  grid-template-columns: 0.95fr 1.8fr 1.1fr 0.9fr;
}

.carte-focus {
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(154, 59, 59, 0.1), transparent 18rem),
    #ffffff;
}

.checklist-securite {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
}

.checklist-securite div {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
  color: var(--couleur-texte);
  font-weight: 800;
}

.checklist-securite svg {
  flex: 0 0 auto;
  color: #9a3b3b;
}

.badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 900;
}

.badge--vert {
  background: rgba(47, 157, 98, 0.13);
  color: #23784a;
}

.badge--orange {
  background: rgba(229, 163, 36, 0.18);
  color: #9a5e00;
}

.bouton-icone {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.6rem;
  background: #ffffff;
  color: #7f3030;
  cursor: pointer;
}

.bouton-icone:hover {
  border-color: #9a3b3b;
  background: #fff4f4;
}

@media (max-width: 1180px) {
  .indicateurs,
  .grille-maintenance {
    grid-template-columns: 1fr;
  }

  .carte-tableau--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .maintenance-hero,
  .barre-outils {
    align-items: stretch;
    flex-direction: column;
  }

  .maintenance-hero__actions,
  .bouton,
  .bouton-filtre {
    width: 100%;
  }

  .badge-securite {
    justify-content: center;
    white-space: normal;
  }
}
</style>
