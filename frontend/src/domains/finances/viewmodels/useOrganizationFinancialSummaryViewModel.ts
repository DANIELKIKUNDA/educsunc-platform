import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { OrganizationFinancialSummaryFilters } from '../models/organization-financial-summary.model';
import { useOrganizationFinancialSummaryStore } from '../stores/organization-financial-summary.store';
import {
  financialSummaryFeeTypeOptions,
  financialSummaryMonthOptions,
  formatFinancialCurrency,
  formatFinancialPercent,
} from './financial-summary.shared';

export function useOrganizationFinancialSummaryViewModel() {
  const context = activeContextStore.state;
  const session = sessionStore.state;
  const route = useRoute();
  const router = useRouter();
  const summaryStore = useOrganizationFinancialSummaryStore();
  const doctrineAccess = useDoctrineAccess();

  const idAnneeScolaireInput = ref('');
  const anneeScolaireLabelInput = ref('');
  const organisationLabelInput = ref('');
  const moisAnalyseInput = ref('');
  const typeFraisInput = ref('');

  const moisOptions = financialSummaryMonthOptions;
  const typeFraisOptions = financialSummaryFeeTypeOptions;

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('VF-05'));
  const summary = computed(() => summaryStore.state.summary);
  const technicalErrorMessage = computed(() =>
    summaryStore.state.errorMessage ?? 'Le backend n a pas pu restituer la synthese financiere d organisation.',
  );
  const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
    if (summaryStore.state.status === 'loading') return 'loading';
    if (summaryStore.state.status === 'error') return 'technical-error';
    return 'idle';
  });
  const fallbackScopeLabel = computed(() => {
    const organisation = organisationLabelInput.value.trim() || context.organizationName;
    const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;
    return `${organisation} | ${annee}`;
  });
  const selectedTypeLabel = computed(() =>
    typeFraisOptions.find((item) => item.value === typeFraisInput.value)?.label ?? 'Tous les frais mensuels',
  );
  const perimeterMessage = computed(() =>
    `Lecture bornee a l organisation active ${context.organizationName}, sans sortie vers une autre organisation.`,
  );

  function lireQueryString(name: string): string {
    const value = route.query[name];
    return typeof value === 'string' ? value : '';
  }

  function synchroniserDepuisRoute(): void {
    idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
    anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
    organisationLabelInput.value = lireQueryString('organisation') || context.organizationName;
    moisAnalyseInput.value = lireQueryString('moisAnalyseJusqua');
    typeFraisInput.value = lireQueryString('typeFrais');
  }

  function construireFiltres(): OrganizationFinancialSummaryFilters {
    return {
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      moisAnalyseJusqua: moisAnalyseInput.value.trim() || undefined,
      typeFrais: typeFraisInput.value.trim() || undefined,
      anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
      organisationLabel: organisationLabelInput.value.trim() || undefined,
    };
  }

  async function chargerSynthese(): Promise<void> {
    if (!isAuthorized.value) {
      summaryStore.reinitialiser();
      return;
    }

    const filtres = construireFiltres();
    if (filtres.idAnneeScolaire.length === 0) {
      summaryStore.reinitialiser();
      return;
    }

    await router.replace({
      query: {
        ...route.query,
        idAnneeScolaire: filtres.idAnneeScolaire,
        anneeScolaire: filtres.anneeScolaireLabel,
        organisation: filtres.organisationLabel,
        moisAnalyseJusqua: filtres.moisAnalyseJusqua,
        typeFrais: filtres.typeFrais,
      },
    });

    await summaryStore.charger(filtres);
  }

  function syntheseEcoleLink(idEcole: string, ecole: string) {
    return {
      path: '/app/finances/synthese-ecole',
      query: {
        idAnneeScolaire: idAnneeScolaireInput.value || undefined,
        anneeScolaire: anneeScolaireLabelInput.value || undefined,
        idEcole,
        ecole,
        moisAnalyseJusqua: moisAnalyseInput.value || undefined,
        typeFrais: typeFraisInput.value || undefined,
      },
    };
  }

  function syntheseSectionHintLink(idEcole: string, ecole: string) {
    return {
      path: '/app/finances/synthese-section',
      query: {
        idAnneeScolaire: idAnneeScolaireInput.value || undefined,
        anneeScolaire: anneeScolaireLabelInput.value || undefined,
        idEcole,
        ecole,
        moisAnalyseJusqua: moisAnalyseInput.value || undefined,
        typeFrais: typeFraisInput.value || undefined,
      },
    };
  }

  function registreHintLink(idEcole: string, ecole: string) {
    return {
      path: '/app/finances/registre-classe',
      query: {
        idAnneeScolaire: idAnneeScolaireInput.value || undefined,
        anneeScolaire: anneeScolaireLabelInput.value || undefined,
        idEcole,
        ecole,
        moisAnalyseJusqua: moisAnalyseInput.value || undefined,
        typeFrais: typeFraisInput.value || undefined,
      },
    };
  }

  function exporterCsv(): void {
    if (!summary.value) return;
    const headers = ['Ecole', 'Effectif total', 'Redevables', 'En ordre', 'Non en ordre', 'Montant attendu', 'Montant recouvre', 'Reste', 'Taux'];
    const lines = [...summary.value.rows, summary.value.totalGeneralOrganisation].map((row) => [
      row.ecole,
      String(row.effectifTotal),
      String(row.redevables),
      String(row.enOrdre),
      String(row.nonEnOrdre),
      String(row.montantAttendu),
      String(row.montantPaye),
      String(row.resteARecouvrer),
      String(row.tauxRecouvrement),
    ]);
    const csv = [headers, ...lines].map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthese-financiere-organisation-${idAnneeScolaireInput.value || 'organisation'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function construireHtmlImprimable(): string {
    if (!summary.value) return '';
    const bodyRows = [...summary.value.rows, summary.value.totalGeneralOrganisation]
      .map((row) => `
      <tr>
        <td>${row.ecole}</td>
        <td>${row.effectifTotal}</td>
        <td>${row.redevables}</td>
        <td>${row.enOrdre}</td>
        <td>${row.nonEnOrdre}</td>
        <td>${formatFinancialCurrency(row.montantAttendu)}</td>
        <td>${formatFinancialCurrency(row.montantPaye)}</td>
        <td>${formatFinancialCurrency(row.resteARecouvrer)}</td>
        <td>${formatFinancialPercent(row.tauxRecouvrement)}</td>
      </tr>
    `)
      .join('');

    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Synthese financiere organisation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #102844; }
          h1, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #b9c6d8; padding: 6px 8px; text-align: left; }
          th { background: #e8eef6; }
        </style>
      </head>
      <body>
        <h1>Situation financiere synthetique d une organisation</h1>
        <p>${summary.value.scopeLabel}</p>
        <p>${summary.value.periodeLabel}</p>
        <p>${summary.value.typeFraisLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Ecole</th>
              <th>Effectif total</th>
              <th>Redevables</th>
              <th>En ordre</th>
              <th>Non en ordre</th>
              <th>Montant attendu</th>
              <th>Montant recouvre</th>
              <th>Reste</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
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

  synchroniserDepuisRoute();
  if (idAnneeScolaireInput.value && isAuthorized.value) {
    void chargerSynthese();
  }

  return {
    context,
    session,
    summaryStore,
    idAnneeScolaireInput,
    anneeScolaireLabelInput,
    organisationLabelInput,
    moisAnalyseInput,
    typeFraisInput,
    moisOptions,
    typeFraisOptions,
    isAuthorized,
    summary,
    technicalErrorMessage,
    uiState,
    fallbackScopeLabel,
    selectedTypeLabel,
    perimeterMessage,
    synchroniserDepuisRoute,
    chargerSynthese,
    syntheseEcoleLink,
    syntheseSectionHintLink,
    registreHintLink,
    formatCurrency: formatFinancialCurrency,
    formatPercent: formatFinancialPercent,
    exporterCsv,
    ouvrirVersionPdf,
    imprimerPage,
  };
}
