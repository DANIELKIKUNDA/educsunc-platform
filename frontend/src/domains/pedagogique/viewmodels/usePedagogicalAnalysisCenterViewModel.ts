import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { PedagogicalAnalysisFilters } from '../models/pedagogical-analysis.model';
import { usePedagogicalAnalysisStore } from '../stores/pedagogical-analysis.store';

export function usePedagogicalAnalysisCenterViewModel() {
  const route = useRoute();
  const router = useRouter();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const analysisStore = usePedagogicalAnalysisStore();
  const doctrineAccess = useDoctrineAccess();

  const anneeScolaireLabelInput = ref('');
  const idClassePedagogiqueInput = ref('');
  const classeLabelInput = ref('');
  const sectionLabelInput = ref('');
  const codeColonneInput = ref('TOTAL_GENERAL');
  const idEleveInput = ref('');
  const eleveLabelInput = ref('');
  const idClassesPedagogiquesInput = ref('');
  const activeTab = ref('echecs');

  const columnOptions = [
    'P1', 'P2', 'EX1', 'TOTAL_S1', 'P3', 'P4', 'EX2', 'TOTAL_S2', 'TOTAL_GENERAL', 'TOTAL_T1', 'TOTAL_T2', 'P5', 'P6', 'EX3', 'TOTAL_T3',
  ];

  const tabs = [
    { code: 'echecs', label: 'Echecs' },
    { code: 'echecsProfonds', label: 'Echecs profonds' },
    { code: 'coursProblematiques', label: 'Cours problematiques' },
    { code: 'comparatifClasses', label: 'Comparatif classes' },
    { code: 'perequation', label: 'Perequation' },
    { code: 'repechage', label: 'Repechage' },
    { code: 'deliberation', label: 'Deliberation' },
    { code: 'secondeSession', label: 'Seconde session' },
    { code: 'nonClasses', label: 'Non classes' },
  ];

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-008'));
  const center = computed(() => analysisStore.state.center);
  const technicalErrorMessage = computed(() =>
    analysisStore.state.errorMessage
    ?? 'Le backend n a pas pu restituer les analyses pedagogiques attendues.',
  );
  const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
    if (analysisStore.state.status === 'loading') return 'loading';
    if (analysisStore.state.status === 'error') return 'technical-error';
    return 'idle';
  });
  const missingFields = computed(() => {
    const manquants: string[] = [];
    if (!context.schoolYearId.trim()) manquants.push('annee');
    if (!idClassePedagogiqueInput.value.trim()) manquants.push('classe');
    if (!codeColonneInput.value.trim()) manquants.push('colonne');
    return manquants;
  });
  const canLoad = computed(() => missingFields.value.length === 0);
  const missingFieldsLabel = computed(() =>
    canLoad.value ? 'Toutes les donnees minimales sont presentes.' : `Manque: ${missingFields.value.join(', ')}`,
  );
  const fallbackScopeLabel = computed(() => {
    const classe = classeLabelInput.value.trim() || 'Classe cible';
    const section = sectionLabelInput.value.trim() || context.sectionName;
    const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;
    return `${classe} | ${section} | ${annee}`;
  });
  const perimeterMessage = computed(() => {
    switch (session.actorCode) {
      case 'TITULAIRE':
        return 'Lecture bornee a la classe titulaire et a la bonne annee scolaire.';
      case 'PREFET_ETUDES':
      case 'DIRECTEUR_ETUDES':
        return 'Lecture bornee a la section secondaire autorisee dans l ecole active.';
      default:
        return `Session visible ${session.actorLabel}. Aucun perimetre analytique officiel n est ouvert pour cet acteur.`;
    }
  });
  const activeTabLabel = computed(() =>
    tabs.find((tab) => tab.code === activeTab.value)?.label ?? 'Analyse',
  );
  const activeTabDescription = computed(() => {
    switch (activeTab.value) {
      case 'coursProblematiques': return 'Lecture des cours qui concentrent des echecs ou des echecs profonds.';
      case 'comparatifClasses': return 'Lecture comparative des classes de reference sur la colonne active.';
      case 'perequation': return 'Lecture des eligibilites a la perequation, secondaire uniquement.';
      case 'repechage': return 'Lecture des dossiers eligibles au repechage, sans moteur de decision final frontend.';
      case 'deliberation': return 'Lecture des dossiers de deliberation exposes par le backend.';
      case 'secondeSession': return 'Lecture analytique des dossiers de seconde session.';
      case 'nonClasses': return 'Lecture des eleves exclus du classement avec motifs exposes.';
      default: return 'Lecture tabulaire directe des projections backend du centre d analyse.';
    }
  });
  const activeRows = computed<Record<string, string>[]>(() => {
    if (!center.value) return [];
    switch (activeTab.value) {
      case 'echecs':
        return center.value.echecs.map((item) => ({
          Eleve: item.nomComplet, Sexe: item.sexe ?? '-', Colonne: item.codeColonne, Pourcentage: item.pourcentage?.toString() ?? '-', Rang: item.rang?.toString() ?? '-', Echecs: item.nombreEchecs.toString(), 'Echecs profonds': item.nombreEchecsProfonds.toString(), Perequation: item.eligiblePerequation ? 'Oui' : 'Non', Repechage: item.eligibleRepechage ? 'Oui' : 'Non',
        }));
      case 'echecsProfonds':
        return center.value.echecsProfonds.map((item) => ({
          Eleve: item.nomComplet, Sexe: item.sexe ?? '-', Colonne: item.codeColonne, Pourcentage: item.pourcentage?.toString() ?? '-', Rang: item.rang?.toString() ?? '-', 'Echecs profonds': item.nombreEchecsProfonds.toString(), Perequation: item.eligiblePerequation ? 'Oui' : 'Non', Repechage: item.eligibleRepechage ? 'Oui' : 'Non',
        }));
      case 'coursProblematiques':
        return center.value.coursProblematiques.map((item) => ({
          'Cours reference': item.idReferentielCours, Colonne: item.codeColonne, 'Effectif echecs': item.effectifEchecs.toString(), 'Effectif echecs profonds': item.effectifEchecsProfonds.toString(), 'Moyenne %': item.moyennePourcentage.toString(), 'Eleves concernes': item.idsElevesConcernes.join(', '),
        }));
      case 'comparatifClasses':
        return center.value.comparatifClasses.map((item) => ({
          Classe: item.libelleClasse, Colonne: item.codeColonne, Participants: item.participantsTotal.toString(), Classes: item.classesTotal.toString(), 'Non classes': item.nonClassesTotal.toString(), Abandons: item.abandonsTotal.toString(), 'Taux reussite': `${item.tauxReussite} %`, 'Taux echec': `${item.tauxEchec} %`,
        }));
      case 'perequation':
        return center.value.perequation.map((item) => ({
          Eleve: item.nomComplet, Sexe: item.sexe ?? '-', Colonne: item.codeColonne, Pourcentage: item.pourcentage?.toString() ?? '-', Rang: item.rang?.toString() ?? '-', Echecs: item.nombreEchecs.toString(), 'Echecs legers': item.nombreEchecsLegers.toString(), 'Echecs profonds': item.nombreEchecsProfonds.toString(),
        }));
      case 'repechage':
        return center.value.repechage.map((item) => dossierRow(item));
      case 'deliberation':
        return center.value.deliberation.map((item) => dossierRow(item));
      case 'secondeSession':
        return center.value.secondeSession.map((item) => dossierRow(item));
      case 'nonClasses':
        return center.value.nonClasses.map((item) => ({
          Eleve: item.nomComplet, Sexe: item.sexe, Motifs: item.motifs.join(', '), 'Cours manquants': item.coursManquants.join(', ') || '-', 'Colonnes manquantes': item.colonnesManquantes.join(', ') || '-',
        }));
      default:
        return [];
    }
  });
  const activeHeaders = computed(() => Object.keys(activeRows.value[0] ?? {}));

  function tabCount(code: string): number {
    if (!center.value) return 0;
    switch (code) {
      case 'echecs': return center.value.echecs.length;
      case 'echecsProfonds': return center.value.echecsProfonds.length;
      case 'coursProblematiques': return center.value.coursProblematiques.length;
      case 'comparatifClasses': return center.value.comparatifClasses.length;
      case 'perequation': return center.value.perequation.length;
      case 'repechage': return center.value.repechage.length;
      case 'deliberation': return center.value.deliberation.length;
      case 'secondeSession': return center.value.secondeSession.length;
      case 'nonClasses': return center.value.nonClasses.length;
      default: return 0;
    }
  }

  function dossierRow(item: {
    nomComplet: string; sexe?: string; codeColonne: string; pourcentage?: number; rang?: number; nombreEchecs: number; nombreEchecsLegers: number; nombreEchecsProfonds: number; eligiblePerequation: boolean; eligibleRepechage: boolean; commentaireTechnique?: string;
  }): Record<string, string> {
    return {
      Eleve: item.nomComplet, Sexe: item.sexe ?? '-', Colonne: item.codeColonne, Pourcentage: item.pourcentage?.toString() ?? '-', Rang: item.rang?.toString() ?? '-', Echecs: item.nombreEchecs.toString(), 'Echecs legers': item.nombreEchecsLegers.toString(), 'Echecs profonds': item.nombreEchecsProfonds.toString(), Perequation: item.eligiblePerequation ? 'Oui' : 'Non', Repechage: item.eligibleRepechage ? 'Oui' : 'Non', Commentaire: item.commentaireTechnique ?? '-',
    };
  }

  function lireQueryString(name: string): string {
    const value = route.query[name];
    return typeof value === 'string' ? value : '';
  }

  function synchroniserDepuisRoute(): void {
    anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
    idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
    classeLabelInput.value = lireQueryString('classe');
    sectionLabelInput.value = lireQueryString('section') || context.sectionName;
    codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
    idEleveInput.value = lireQueryString('idEleve');
    eleveLabelInput.value = lireQueryString('eleve');
    idClassesPedagogiquesInput.value = lireQueryString('idClassesPedagogiques');
    activeTab.value = lireQueryString('onglet') || 'echecs';
  }

  function reinitialiserFiltres(): void {
    anneeScolaireLabelInput.value = context.schoolYearLabel;
    idClassePedagogiqueInput.value = '';
    classeLabelInput.value = '';
    sectionLabelInput.value = context.sectionName;
    codeColonneInput.value = 'TOTAL_GENERAL';
    idEleveInput.value = '';
    eleveLabelInput.value = '';
    idClassesPedagogiquesInput.value = '';
    activeTab.value = 'echecs';
    analysisStore.reinitialiser();
  }

  function construireFiltres(): PedagogicalAnalysisFilters {
    return {
      idAnneeScolaire: context.schoolYearId.trim(),
      idClassePedagogique: idClassePedagogiqueInput.value.trim(),
      codeColonne: codeColonneInput.value.trim(),
      idEleve: idEleveInput.value.trim() || undefined,
      idClassesPedagogiques: idClassesPedagogiquesInput.value.trim() || undefined,
      anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
      classeLabel: classeLabelInput.value.trim() || undefined,
      sectionLabel: sectionLabelInput.value.trim() || undefined,
      eleveLabel: eleveLabelInput.value.trim() || undefined,
    };
  }

  async function chargerCentre(): Promise<void> {
    if (!isAuthorized.value) {
      analysisStore.reinitialiser();
      return;
    }
    const filtres = construireFiltres();
    if (filtres.idAnneeScolaire.length === 0 || filtres.idClassePedagogique.length === 0 || filtres.codeColonne.length === 0) {
      analysisStore.reinitialiser();
      return;
    }
    await router.replace({
      query: {
        ...route.query,
        idAnneeScolaire: filtres.idAnneeScolaire,
        anneeScolaire: filtres.anneeScolaireLabel,
        idClassePedagogique: filtres.idClassePedagogique,
        classe: filtres.classeLabel,
        section: filtres.sectionLabel,
        codeColonne: filtres.codeColonne,
        idEleve: filtres.idEleve,
        eleve: filtres.eleveLabel,
        idClassesPedagogiques: filtres.idClassesPedagogiques,
        onglet: activeTab.value,
      },
    });
    await analysisStore.charger(filtres);
  }

  function exporterVueActive(): void {
    if (activeRows.value.length === 0) return;
    const headers = activeHeaders.value;
    const csv = [headers, ...activeRows.value.map((row) => headers.map((header) => row[header] ?? ''))]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-pedagogique-${activeTab.value}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function construireHtmlImprimable(): string {
    const headers = activeHeaders.value;
    const rows = activeRows.value
      .map((row) => `<tr>${headers.map((header) => `<td>${row[header] ?? '-'}</td>`).join('')}</tr>`)
      .join('');
    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Centre d analyse pedagogique</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #11283f; }
          h1, h2, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #c4d1df; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #edf3f8; }
        </style>
      </head>
      <body>
        <h1>Centre d analyse pedagogique</h1>
        <p>${center.value?.scopeLabel ?? fallbackScopeLabel.value}</p>
        <p>Onglet actif : ${activeTabLabel.value}</p>
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
  }

  function ouvrirVersionPdf(): void {
    const html = construireHtmlImprimable();
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=900');
    if (!popup) return;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function imprimerPage(): void {
    window.print();
  }

  synchroniserDepuisRoute();
  if (context.schoolYearId && idClassePedagogiqueInput.value && isAuthorized.value) {
    void chargerCentre();
  }

  return {
    session,
    context,
    analysisStore,
    anneeScolaireLabelInput,
    idClassePedagogiqueInput,
    classeLabelInput,
    sectionLabelInput,
    codeColonneInput,
    idEleveInput,
    eleveLabelInput,
    idClassesPedagogiquesInput,
    activeTab,
    columnOptions,
    tabs,
    isAuthorized,
    center,
    technicalErrorMessage,
    uiState,
    missingFields,
    canLoad,
    missingFieldsLabel,
    fallbackScopeLabel,
    perimeterMessage,
    activeTabLabel,
    activeTabDescription,
    activeRows,
    activeHeaders,
    tabCount,
    synchroniserDepuisRoute,
    reinitialiserFiltres,
    chargerCentre,
    exporterVueActive,
    ouvrirVersionPdf,
    imprimerPage,
  };
}
