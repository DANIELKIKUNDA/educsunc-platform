import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';


export interface MessageAlerte {
  titre: string;
  message: string;
  type: 'danger' | 'attention' | 'succes' | 'info';
  timestamp: Date;
  actions?: Array<{ libelle: string; action: () => void }>;
}

export interface ClassePedagogique {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
  statut: 'actif' | 'preparation' | 'cloture';
  dernierAcces: Date;
}

export interface ReferentielOfficiel {
  libelle: string;
  valeur: string;
  statut: 'actif' | 'obsolete' | 'mise_a_jour';
  version?: string;
  derniereMiseAJour: Date;
}

export interface KPIData {
  anneeActive: string;
  statutAnnee: 'en_cours' | 'preparation' | 'cloture';
  classesCount: number;
  classesStatut: 'connectees' | 'partielles' | 'deconnectees';
  programmesStatut: 'valides' | 'verification' | 'incomplets';
  calendrierStatut: 'verrouille' | 'preparation' | 'ouvert';
  periodeEnCours: string;
  prochainePeriode: string;
}

const demoData = reactive({
  messages: [
    {
      titre: 'Préparation année scolaire',
      message: 'L\'année 2024-2025 doit être configurée avant le 31 août pour garantir la continuité pédagogique.',
      type: 'attention' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures ago
      actions: [
        { libelle: 'Configurer maintenant', action: () => {} } 
      ]
    },
    {
      titre: 'Synchronisation programmes',
      message: '3 programmes niveau nécessitent une validation après la dernière mise à jour du référentiel MINEDUC.',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 heures ago
      actions: [
        { libelle: 'Vérifier programmes', action: () => {} } 
      ]
    },
    {
      titre: 'Calendrier académique',
      message: 'La période d\'examens de fin de trimestre doit être verrouillée dans les 48 prochaines heures.',
      type: 'danger' as const,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      actions: [
        { libelle: 'Verrouiller période', action: () => {} } 
      ]
    }
  ] as MessageAlerte[],

  classes: [
    {
      id: '1',
      nom: '6ème A',
      niveau: 'Première année',
      effectif: 28,
      statut: 'actif' as const,
      dernierAcces: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      id: '2',
      nom: '5ème B',
      niveau: 'Deuxième année',
      effectif: 32,
      statut: 'actif' as const,
      dernierAcces: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '3',
      nom: '4ème C',
      niveau: 'Troisième année',
      effectif: 25,
      statut: 'preparation' as const,
      dernierAcces: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  ] as ClassePedagogique[],

  referentielOfficiel: [
    {
      libelle: 'Sections scolaires',
      valeur: 'Secondaire général',
      statut: 'actif' as const,
      version: 'MINEDUC-2024-2025-V2',
      derniereMiseAJour: new Date('2024-01-15')
    },
    {
      libelle: 'Classes académiques',
      valeur: '6 classes officielles',
      statut: 'actif' as const,
      version: 'MINEDUC-2024-2025-V2',
      derniereMiseAJour: new Date('2024-01-15')
    },
    {
      libelle: 'Programmes niveau',
      valeur: '42 cours validés',
      statut: 'mise_a_jour' as const,
      version: 'MINEDUC-2024-2025-V3',
      derniereMiseAJour: new Date('2024-03-10')
    },
    {
      libelle: 'Calendrier académique',
      valeur: '3 périodes définies',
      statut: 'actif' as const,
      version: 'MINEDUC-2024-2025-V1',
      derniereMiseAJour: new Date('2024-02-01')
    }
  ] as ReferentielOfficiel[],

  kpiData: {
    anneeActive: '2024-2025',
    statutAnnee: 'en_cours' as const,
    classesCount: 12,
    classesStatut: 'partielles' as const,
    programmesStatut: 'verification' as const,
    calendrierStatut: 'preparation' as const,
    periodeEnCours: 'Trimestre 2',
    prochainePeriode: 'Examens fin T2'
  } as KPIData
});

export const referentielEcoleDemoStore = () => {
  const router = useRouter();
  const isLoading = ref(false);
  const lastSync = ref(new Date(Date.now() - 5 * 60 * 1000)); // 5 minutes ago

  // Actions fonctionnelles
  const naviguerVers = (path: string) => {
    router.push(path);
  };

  const preparerAnneeSuivante = () => {
    naviguerVers('/referentiel/ecole/annees');
  };

  const explorerReferentiel = () => {
    naviguerVers('/referentiel/ecole/officiel');
  };

  const verifierProgrammes = () => {
    naviguerVers('/referentiel/ecole/programmes-niveau');
  };

  const gererClasses = () => {
    naviguerVers('/referentiel/ecole/classes-pedagogiques');
  };

  const verrouillerPeriode = () => {
    naviguerVers('/referentiel/ecole/calendriers');
  };

  const traiterPriorites = () => {
    // Filtrer les alertes par priorité et naviguer vers la première
    const alertePrioritaire = demoData.messages.find(m => m.type === 'danger');
    if (alertePrioritaire) {
      switch (alertePrioritaire.titre) {
        case 'Calendrier académique':
          verrouillerPeriode();
          break;
        case 'Préparation année scolaire':
          preparerAnneeSuivante();
          break;
        case 'Synchronisation programmes':
          verifierProgrammes();
          break;
      }
    }
  };

  // Mettre à jour les actions dans les données de démo
  demoData.messages[0].actions![0].action = preparerAnneeSuivante;
  demoData.messages[1].actions![0].action = verifierProgrammes;
  demoData.messages[2].actions![0].action = verrouillerPeriode;

  // Simuler un chargement
  const chargerDonnees = async () => {
    isLoading.value = true;
    
    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    isLoading.value = false;
    lastSync.value = new Date();
  };

  // Formater les timestamps relatifs
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Obtenir les KPIs formatés
  const getKPIData = () => {
    return {
      ...demoData.kpiData,
      anneeActive: demoData.kpiData.statutAnnee === 'en_cours' 
        ? demoData.kpiData.anneeActive 
        : 'À configurer',
      statutAnnee: demoData.kpiData.statutAnnee === 'en_cours' 
        ? 'Active' 
        : demoData.kpiData.statutAnnee === 'preparation' 
          ? 'Préparation' 
          : 'Clôturée',
      classesStatut: demoData.kpiData.classesStatut === 'partielles' 
        ? `${demoData.kpiData.classesCount} classes` 
        : demoData.kpiData.classesStatut === 'connectees' 
          ? 'Toutes connectées' 
          : 'Déconnectées',
      programmesStatut: demoData.kpiData.programmesStatut === 'verification' 
        ? 'À vérifier' 
        : demoData.kpiData.programmesStatut === 'valides' 
          ? 'Validés' 
          : 'Incomplets',
      calendrierStatut: demoData.kpiData.calendrierStatut === 'preparation' 
        ? 'À verrouiller' 
        : demoData.kpiData.calendrierStatut === 'verrouille' 
          ? 'Verrouillé' 
          : 'Ouvert'
    };
  };

  return {
    // État
    isLoading,
    lastSync,
    
    // Données
    messages: demoData.messages,
    classes: demoData.classes,
    referentielOfficiel: demoData.referentielOfficiel,
    
    // Actions fonctionnelles
    preparerAnneeSuivante,
    explorerReferentiel,
    verifierProgrammes,
    gererClasses,
    verrouillerPeriode,
    traiterPriorites,
    
    // Méthodes
    chargerDonnees,
    formatRelativeTime,
    getKPIData
  };
};
