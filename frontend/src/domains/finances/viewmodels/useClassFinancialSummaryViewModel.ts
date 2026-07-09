import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { ClassFinancialSummaryFilters } from '../models/class-financial-summary.model';
import { useClassFinancialSummaryStore } from '../stores/class-financial-summary.store';
import {
  financialSummaryFeeTypeOptions,
  financialSummaryMonthOptions,
  formatFinancialCurrency,
  formatFinancialPercent,
} from './financial-summary.shared';

export function useClassFinancialSummaryViewModel() {
  const context = activeContextStore.state;
  const session = sessionStore.state;
  const route = useRoute();
  const router = useRouter();
  const summaryStore = useClassFinancialSummaryStore();
  const doctrineAccess = useDoctrineAccess();

  const idAnneeScolaireInput = ref('');
  const anneeScolaireLabelInput = ref('');
  const idClassePedagogiqueInput = ref('');
  const classeLabelInput = ref('');
  const sectionLabelInput = ref('');
  const moisAnalyseInput = ref('');
  const typeFraisInput = ref('');

  const moisOptions = financialSummaryMonthOptions;
  const typeFraisOptions = financialSummaryFeeTypeOptions;

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('VF-02'));
  const summary = computed(() => summaryStore.state.summary);
  const technicalErrorMessage = computed(() =>
    summaryStore.state.errorMessage ?? 'Le backend n a pas pu restituer la synthese financiere de classe.',
  );
  const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
    if (summaryStore.state.status === 'loading') return 'loading';
    if (summaryStore.state.status === 'error') return 'technical-error';
    return 'idle';
  });
  const fallbackScopeLabel = computed(() => {
    const classe = classeLabelInput.value.trim() || 'Classe cible';
    const section = sectionLabelInput.value.trim() || context.sectionName;
    const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;
    return `${classe} | ${section} | ${annee}`;
  });
  const selectedTypeLabel = computed(() =>
    typeFraisOptions.find((item) => item.value === typeFraisInput.value)?.label ?? 'Tous les frais mensuels',
  );
  const registreLink = computed(() => ({
    path: '/app/finances/registre-classe',
    query: {
      idAnneeScolaire: idAnneeScolaireInput.value || undefined,
      anneeScolaire: anneeScolaireLabelInput.value || undefined,
      idClassePedagogique: idClassePedagogiqueInput.value || undefined,
      classe: classeLabelInput.value || undefined,
      section: sectionLabelInput.value || undefined,
      moisAnalyseJusqua: moisAnalyseInput.value || undefined,
    },
  }));
  const perimeterMessage = computed(() => {
    switch (session.actorCode) {
      case 'PROMOTEUR_ORGANISATION':
      case 'GESTIONNAIRE_ORGANISATION':
        return `Lecture bornee a l organisation active ${context.organizationName}, avec descente controlee vers la classe cible.`;
      case 'TITULAIRE':
        return 'Lecture bornee a la classe titulaire et a la bonne annee scolaire.';
      case 'PREFET_ETUDES':
      case 'DIRECTEUR_ETUDES':
        return 'Lecture bornee a la section secondaire autorisee.';
      case 'DIRECTEUR_PRIMAIRE':
        return 'Lecture bornee a la section primaire autorisee.';
      case 'DIRECTEUR_MATERNELLE':
        return 'Lecture bornee a la section maternelle autorisee.';
      default:
        return `Lecture bornee a l ecole active ${context.schoolName}.`;
    }
  });

  function lireQueryString(name: string): string {
    const value = route.query[name];
    return typeof value === 'string' ? value : '';
  }

  function synchroniserDepuisRoute(): void {
    idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
    anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
    idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
    classeLabelInput.value = lireQueryString('classe');
    sectionLabelInput.value = lireQueryString('section') || context.sectionName;
    moisAnalyseInput.value = lireQueryString('moisAnalyseJusqua');
    typeFraisInput.value = lireQueryString('typeFrais');
  }

  function construireFiltres(): ClassFinancialSummaryFilters {
    return {
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      idClassePedagogique: idClassePedagogiqueInput.value.trim(),
      moisAnalyseJusqua: moisAnalyseInput.value.trim() || undefined,
      typeFrais: typeFraisInput.value.trim() || undefined,
      anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
      classeLabel: classeLabelInput.value.trim() || undefined,
      sectionLabel: sectionLabelInput.value.trim() || undefined,
    };
  }

  async function chargerSynthese(): Promise<void> {
    if (!isAuthorized.value) {
      summaryStore.reinitialiser();
      return;
    }

    const filtres = construireFiltres();
    if (filtres.idAnneeScolaire.length === 0 || filtres.idClassePedagogique.length === 0) {
      summaryStore.reinitialiser();
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
        moisAnalyseJusqua: filtres.moisAnalyseJusqua,
        typeFrais: filtres.typeFrais,
      },
    });

    await summaryStore.charger(filtres);
  }

  function exporterCsv(): void {
    if (!summary.value) return;
    const headers = ['Mois', 'Effectif total', 'Redevables', 'En ordre', 'Non en ordre', 'Montant attendu', 'Montant recouvre', 'Reste', 'Taux'];
    const lines = summary.value.rows.map((row) => [
      row.mois,
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
    link.download = `synthese-financiere-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function construireHtmlImprimable(): string {
    if (!summary.value) return '';
    const bodyRows = summary.value.rows
      .map((row) => `
      <tr>
        <td>${row.mois}</td>
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
        <title>Synthese financiere de classe</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #102844; }
          h1, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #b9c6d8; padding: 6px 8px; text-align: left; }
          th { background: #e8eef6; }
        </style>
      </head>
      <body>
        <h1>Situation financiere synthetique par classe</h1>
        <p>${summary.value.scopeLabel}</p>
        <p>${summary.value.periodeLabel}</p>
        <p>${summary.value.typeFraisLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Effectif total</th>
              <th>Redevables</th>
              <th>En ordre</th>
              <th>Non en ordre</th>
              <th>Montant attendu</th>
              <th>Montant recouvre</th>
              <th>Reste a recouvrer</th>
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
  if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && isAuthorized.value) {
    void chargerSynthese();
  }

  return {
    context,
    session,
    summaryStore,
    idAnneeScolaireInput,
    anneeScolaireLabelInput,
    idClassePedagogiqueInput,
    classeLabelInput,
    sectionLabelInput,
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
    registreLink,
    perimeterMessage,
    synchroniserDepuisRoute,
    chargerSynthese,
    formatCurrency: formatFinancialCurrency,
    formatPercent: formatFinancialPercent,
    exporterCsv,
    ouvrirVersionPdf,
    imprimerPage,
  };
}
