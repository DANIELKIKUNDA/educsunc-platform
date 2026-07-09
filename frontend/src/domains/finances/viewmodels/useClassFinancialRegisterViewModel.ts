import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type {
  ClassFinancialRegisterCellViewModel,
  ClassFinancialRegisterFilters,
  ClassFinancialRegisterRowViewModel,
} from '../models/class-financial-register.model';
import { useClassFinancialRegisterStore } from '../stores/class-financial-register.store';

export function useClassFinancialRegisterViewModel() {
  const context = activeContextStore.state;
  const session = sessionStore.state;
  const route = useRoute();
  const router = useRouter();
  const registerStore = useClassFinancialRegisterStore();
  const doctrineAccess = useDoctrineAccess();

  const idAnneeScolaireInput = ref('');
  const anneeScolaireLabelInput = ref('');
  const idClassePedagogiqueInput = ref('');
  const classeLabelInput = ref('');
  const sectionLabelInput = ref('');
  const moisAnalyseInput = ref('');
  const mobileColumnCode = ref('');

  const moisOptions = [
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre',
    'Janvier',
    'Fevrier',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
  ];

  const statusLegend = [
    { code: 'AG', label: 'Enfant agent' },
    { code: 'EX', label: 'Exonere total' },
    { code: 'EX50', label: 'Exonere partiel' },
    { code: 'FN', label: 'Fonds non redevables selon le frais' },
    { code: 'PC', label: 'Prise en charge partielle ou ciblee' },
    { code: 'AB', label: 'Abandon, hors calcul apres date' },
    { code: 'TR', label: 'Transfere, hors calcul apres date' },
    { code: 'DC', label: 'Decede, hors calcul apres date' },
  ];

  const isAuthorized = computed(() => doctrineAccess.canAccessPage('VF-01'));
  const register = computed(() => registerStore.state.register);
  const technicalErrorMessage = computed(() =>
    registerStore.state.errorMessage
    ?? 'Le backend n a pas pu restituer le registre financier de classe.',
  );
  const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
    if (registerStore.state.status === 'loading') {
      return 'loading';
    }

    if (registerStore.state.status === 'error') {
      return 'technical-error';
    }

    return 'idle';
  });

  const fallbackScopeLabel = computed(() => {
    const classe = classeLabelInput.value.trim() || 'Classe cible';
    const section = sectionLabelInput.value.trim() || context.sectionName;
    const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;

    return `${classe} | ${section} | ${annee}`;
  });

  const selectedMobileColumn = computed(() =>
    register.value?.columns.find((column) => column.code === mobileColumnCode.value) ?? null,
  );

  const perimeterMessage = computed(() => {
    switch (session.actorCode) {
      case 'PROMOTEUR_ORGANISATION':
      case 'GESTIONNAIRE_ORGANISATION':
        return `Lecture bornee a l organisation active ${context.organizationName}, avec descente controlee vers l ecole puis la classe.`;
      case 'TITULAIRE':
        return 'Lecture bornee a la classe titulaire et a l annee scolaire active, jamais a une autre classe.';
      case 'PREFET_ETUDES':
      case 'DIRECTEUR_ETUDES':
        return 'Lecture bornee a la section secondaire autorisee dans l ecole active.';
      case 'DIRECTEUR_PRIMAIRE':
        return 'Lecture bornee a la section primaire autorisee dans l ecole active.';
      case 'DIRECTEUR_MATERNELLE':
        return 'Lecture bornee a la section maternelle autorisee dans l ecole active.';
      case 'CAISSIER':
      case 'ADMINISTRATEUR_ECOLE':
        return `Lecture bornee a l ecole active ${context.schoolName} et a la classe demandee.`;
      default:
        return `Session visible ${session.actorLabel}. Aucun perimetre financier officiel n est ouvert pour cet acteur.`;
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
  }

  function reinitialiserFiltres(): void {
    idAnneeScolaireInput.value = '';
    anneeScolaireLabelInput.value = context.schoolYearLabel;
    idClassePedagogiqueInput.value = '';
    classeLabelInput.value = '';
    sectionLabelInput.value = context.sectionName;
    moisAnalyseInput.value = '';
    mobileColumnCode.value = '';
    registerStore.reinitialiser();
  }

  function construireFiltres(): ClassFinancialRegisterFilters {
    return {
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      idClassePedagogique: idClassePedagogiqueInput.value.trim(),
      moisAnalyseJusqua: moisAnalyseInput.value.trim() || undefined,
      anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
      classeLabel: classeLabelInput.value.trim() || undefined,
      sectionLabel: sectionLabelInput.value.trim() || undefined,
    };
  }

  async function chargerRegistre(): Promise<void> {
    if (!isAuthorized.value) {
      registerStore.reinitialiser();
      return;
    }

    const filtres = construireFiltres();

    if (filtres.idAnneeScolaire.length === 0 || filtres.idClassePedagogique.length === 0) {
      registerStore.reinitialiser();
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
      },
    });

    await registerStore.charger(filtres);

    if (!mobileColumnCode.value && registerStore.state.register?.columns.length) {
      mobileColumnCode.value = registerStore.state.register.columns[0].code;
    }
  }

  function selectedMobileCell(row: ClassFinancialRegisterRowViewModel): ClassFinancialRegisterCellViewModel | null {
    return row.cells.find((cell) => cell.colonneCode === mobileColumnCode.value) ?? null;
  }

  function formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
  }

  function cellStatusClass(code: string): string {
    if (code === 'OK') {
      return 'finance-register-token finance-register-token--success';
    }

    if (code === 'AB' || code === 'TR' || code === 'DC') {
      return 'finance-register-token finance-register-token--muted';
    }

    if (code === 'NR') {
      return 'finance-register-token finance-register-token--neutral';
    }

    return 'finance-register-token finance-register-token--warning';
  }

  function exporterCsv(): void {
    if (!register.value) {
      return;
    }

    const headers = [
      'Numero',
      'Matricule',
      'Nom complet',
      'Sexe',
      ...register.value.columns.map((column) => column.libelle),
      'Total attendu',
      'Total paye',
      'Reste',
      'Etat',
    ];

    const lines = register.value.rows.map((row) => [
      String(row.numeroOrdre),
      row.matricule,
      row.fullName,
      row.sexe,
      ...row.cells.map((cell) => cell.statutAffiche),
      String(row.totalAttendu),
      String(row.totalPaye),
      String(row.totalReste),
      row.estEnOrdre ? 'En ordre' : 'Non en ordre',
    ]);

    const csv = [headers, ...lines]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registre-financier-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function construireHtmlImprimable(): string {
    if (!register.value) {
      return '';
    }

    const headerCells = register.value.columns
      .map((column) => `<th>${column.libelle}</th>`)
      .join('');

    const bodyRows = register.value.rows
      .map((row) => `
      <tr>
        <td>${row.numeroOrdre}</td>
        <td>${row.fullName}</td>
        <td>${row.sexe}</td>
        ${row.cells.map((cell) => `<td>${cell.statutAffiche}</td>`).join('')}
        <td>${formatCurrency(row.totalAttendu)}</td>
        <td>${formatCurrency(row.totalPaye)}</td>
        <td>${formatCurrency(row.totalReste)}</td>
      </tr>
    `)
      .join('');

    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Registre financier de classe</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #102844; }
          h1, h2, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #b9c6d8; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #e8eef6; }
          .meta { margin-bottom: 12px; }
          .meta strong { display: inline-block; min-width: 120px; }
        </style>
      </head>
      <body>
        <h1>Registre financier de classe</h1>
        <p>${register.value.scopeLabel}</p>
        <p>${register.value.periodeLabel}</p>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Eleve</th>
              <th>Sexe</th>
              ${headerCells}
              <th>Total attendu</th>
              <th>Total paye</th>
              <th>Reste</th>
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
  }

  function ouvrirVersionPdf(): void {
    const html = construireHtmlImprimable();

    if (html.length === 0) {
      return;
    }

    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=900');

    if (!popup) {
      return;
    }

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
    void chargerRegistre();
  }

  return {
    context,
    session,
    registerStore,
    idAnneeScolaireInput,
    anneeScolaireLabelInput,
    idClassePedagogiqueInput,
    classeLabelInput,
    sectionLabelInput,
    moisAnalyseInput,
    mobileColumnCode,
    moisOptions,
    statusLegend,
    isAuthorized,
    register,
    technicalErrorMessage,
    uiState,
    fallbackScopeLabel,
    selectedMobileColumn,
    perimeterMessage,
    synchroniserDepuisRoute,
    reinitialiserFiltres,
    chargerRegistre,
    selectedMobileCell,
    formatCurrency,
    cellStatusClass,
    exporterCsv,
    ouvrirVersionPdf,
    imprimerPage,
  };
}
