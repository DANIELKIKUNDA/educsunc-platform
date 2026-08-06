import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { isOwnedStudentTargetAllowed } from '../../../shared/permissions/parent-ownership';
import {
  hasTitulariatEffectif,
  isTitulariatTargetAllowed,
} from '../access/titulariat-experience';
import type { PedagogicalAnalysisFilters } from '../models/pedagogical-analysis.model';
import { useStudentResultDetailStore } from '../stores/student-result-detail.store';

export function useStudentResultDetailViewModel() {
  const route = useRoute();
  const router = useRouter();
  const context = activeContextStore.state;
  const session = sessionStore.state;
  const detailStore = useStudentResultDetailStore();
  const doctrineAccess = useDoctrineAccess();

  const anneeScolaireLabelInput = ref('');
  const idClassePedagogiqueInput = ref('');
  const classeLabelInput = ref('');
  const sectionLabelInput = ref('');
  const idEleveInput = ref('');
  const eleveLabelInput = ref('');
  const codeColonneInput = ref('TOTAL_GENERAL');

  const columnOptions = [
    'P1', 'P2', 'EX1', 'TOTAL_S1', 'P3', 'P4', 'EX2', 'TOTAL_S2', 'TOTAL_GENERAL', 'TOTAL_T1', 'TOTAL_T2', 'P5', 'P6', 'EX3', 'TOTAL_T3',
  ];

  const columnLabels: Record<string, string> = {
    P1: 'Periode 1',
    P2: 'Periode 2',
    EX1: 'Examen 1',
    TOTAL_S1: 'Total semestre 1',
    P3: 'Periode 3',
    P4: 'Periode 4',
    EX2: 'Examen 2',
    TOTAL_S2: 'Total semestre 2',
    TOTAL_GENERAL: 'Total general',
    TOTAL_T1: 'Total trimestre 1',
    TOTAL_T2: 'Total trimestre 2',
    P5: 'Periode 5',
    P6: 'Periode 6',
    EX3: 'Examen 3',
    TOTAL_T3: 'Total trimestre 3',
  };

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-DET-001'));
  const detail = computed(() => detailStore.state.detail);
  const canLoad = computed(() =>
    context.schoolYearId.trim().length > 0
    && idEleveInput.value.trim().length > 0
    && isOwnedStudentTargetAllowed(idEleveInput.value)
    && isTitulariatTargetAllowed(
      idClassePedagogiqueInput.value,
      context.schoolYearId,
    ),
  );
  const activeColumnLabel = computed(() => columnLabels[codeColonneInput.value] ?? codeColonneInput.value);
  const actorScopeMessage = computed(() => {
    if (detail.value) {
      return `Lecture analytiquement bornee a ${detail.value.classeLabel} / ${detail.value.sectionLabel}.`;
    }
    if (hasTitulariatEffectif()) {
      return 'Lecture analytiquement bornee a la classe titulaire et a l annee scolaire active.';
    }

    switch (session.actorCode) {
      case 'PREFET_ETUDES':
      case 'DIRECTEUR_ETUDES':
        return 'Lecture analytiquement bornee a la section secondaire autorisee de l ecole active.';
      default:
        return 'Aucun perimetre pedagogique officiel n est ouvert pour cet acteur.';
    }
  });
  const technicalErrorMessage = computed(() =>
    detailStore.state.errorMessage
    ?? 'Le backend n a pas pu restituer le detail resultat eleve.',
  );
  const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
    if (detailStore.state.status === 'loading') return 'loading';
    if (detailStore.state.status === 'error') return 'technical-error';
    return 'idle';
  });

  function lireQueryString(name: string): string {
    const value = route.query[name];
    return typeof value === 'string' ? value : '';
  }

  function synchroniserDepuisRoute(): void {
    anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
    idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
    classeLabelInput.value = lireQueryString('classe');
    sectionLabelInput.value = lireQueryString('section') || context.sectionName;
    idEleveInput.value = lireQueryString('idEleve');
    eleveLabelInput.value = lireQueryString('eleve');
    codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
  }

  function reinitialiserFiltres(): void {
    anneeScolaireLabelInput.value = context.schoolYearLabel;
    idClassePedagogiqueInput.value = '';
    classeLabelInput.value = '';
    sectionLabelInput.value = context.sectionName;
    idEleveInput.value = '';
    eleveLabelInput.value = '';
    codeColonneInput.value = 'TOTAL_GENERAL';
    detailStore.reinitialiser();
    void router.replace({ query: {} });
  }

  function construireFiltres(): PedagogicalAnalysisFilters {
    return {
      idAnneeScolaire: context.schoolYearId.trim(),
      idClassePedagogique: idClassePedagogiqueInput.value.trim(),
      codeColonne: codeColonneInput.value.trim(),
      idEleve: idEleveInput.value.trim() || undefined,
      anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
      classeLabel: classeLabelInput.value.trim() || undefined,
      sectionLabel: sectionLabelInput.value.trim() || undefined,
      eleveLabel: eleveLabelInput.value.trim() || undefined,
    };
  }

  async function chargerDetail(): Promise<void> {
    if (!isAuthorized.value) {
      detailStore.reinitialiser();
      return;
    }

    const filtres = construireFiltres();
    if (
      filtres.idAnneeScolaire.length === 0
      || !filtres.idEleve
      || filtres.idEleve.length === 0
      || !isOwnedStudentTargetAllowed(filtres.idEleve)
      || !isTitulariatTargetAllowed(
        filtres.idClassePedagogique,
        filtres.idAnneeScolaire,
      )
    ) {
      detailStore.reinitialiser();
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
        idEleve: filtres.idEleve,
        eleve: filtres.eleveLabel,
        codeColonne: filtres.codeColonne,
      },
    });

    await detailStore.charger(filtres);
  }

  function exporterCsv(): void {
    if (!detail.value) return;
    const headers = ['Colonne', 'Total obtenu', 'Maximum', 'Pourcentage', 'Rang', 'Classable', 'Non classe'];
    const lines = detail.value.resultColumns.map((column) => [
      column.label,
      column.totalObtenu,
      column.maximumGeneral,
      column.pourcentage,
      column.rang,
      column.estClassable ? 'Oui' : 'Non',
      column.estNonClasse ? 'Oui' : 'Non',
    ]);
    const csv = [headers, ...lines]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detail-resultat-${detail.value.eleveId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function construireHtmlImprimable(): string {
    if (!detail.value) return '';
    const rows = detail.value.resultColumns
      .map((column) => `
      <tr>
        <td>${column.label}</td>
        <td>${column.totalObtenu}</td>
        <td>${column.maximumGeneral}</td>
        <td>${column.pourcentage}</td>
        <td>${column.rang}</td>
        <td>${column.estClassable ? 'Oui' : 'Non'}</td>
        <td>${column.estNonClasse ? 'Oui' : 'Non'}</td>
      </tr>
    `)
      .join('');
    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Detail resultat eleve</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #11283f; }
          h1, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #c4d1df; padding: 8px; text-align: left; }
          th { background: #edf4f8; }
        </style>
      </head>
      <body>
        <h1>Detail resultat eleve</h1>
        <p>${detail.value.eleveLabel}</p>
        <p>${detail.value.classeLabel} | ${detail.value.anneeScolaireLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Colonne</th>
              <th>Total obtenu</th>
              <th>Maximum</th>
              <th>Pourcentage</th>
              <th>Rang</th>
              <th>Classable</th>
              <th>Non classe</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
  }

  function ouvrirVersionPdf(): void {
    const html = construireHtmlImprimable();
    if (html.length === 0) return;
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

  function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
  }

  synchroniserDepuisRoute();
  if (context.schoolYearId && idEleveInput.value && isAuthorized.value) {
    void chargerDetail();
  }

  return {
    context,
    session,
    detailStore,
    anneeScolaireLabelInput,
    idClassePedagogiqueInput,
    classeLabelInput,
    sectionLabelInput,
    idEleveInput,
    eleveLabelInput,
    codeColonneInput,
    columnOptions,
    isAuthorized,
    detail,
    canLoad,
    activeColumnLabel,
    actorScopeMessage,
    technicalErrorMessage,
    uiState,
    synchroniserDepuisRoute,
    reinitialiserFiltres,
    chargerDetail,
    exporterCsv,
    ouvrirVersionPdf,
    imprimerPage,
    formatDate,
  };
}
