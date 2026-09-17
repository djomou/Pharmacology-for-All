/**
 * MOTEUR DE CORRESPONDANCE SYMPTÔMES
 * Chaque symptôme connu est associé à des mots-clés français
 * et à des termes médicaux qui correspondent dans la base VXP.
 */
export interface SymptomMapping {
  symptomLabel:   string;        // Libellé affiché au patient
  keywords:       string[];      // Mots déclencheurs dans la saisie libre
  searchTerms:    string[];      // Termes à rechercher dans la base (indications)
  moleculeTerms:  string[];      // Molécules connues pour ce symptôme
  severity:       'low' | 'medium' | 'high';
  warningMessage: string;        // Message de prudence spécifique
}

export const SYMPTOM_MAPPINGS: SymptomMapping[] = [
  {
    symptomLabel: 'Maux de tête / Céphalées',
    keywords: [
      'maux de tete', 'mal de tete', 'cephalee', 'migraine',
      'tete qui fait mal', 'douleur tete', 'migraine', 'crane',
    ],
    searchTerms: ['céphalée', 'migraine', 'douleur', 'cephalee'],
    moleculeTerms: ['paracetamol', 'ibuprofene', 'aspirine', 'codeine'],
    severity: 'low',
    warningMessage: 'Si les maux de tête sont soudains et intenses, consultez immédiatement.',
  },
  {
    symptomLabel: 'Fièvre',
    keywords: [
      'fievre', 'température', 'temperature', 'chaud', 'hyperthermie',
      'j ai chaud', 'je transpire', 'frissons',
    ],
    searchTerms: ['fièvre', 'hyperthermie', 'fievre'],
    moleculeTerms: ['paracetamol', 'ibuprofene', 'aspirine'],
    severity: 'medium',
    warningMessage: 'Une fièvre supérieure à 39°C ou persistante nécessite une consultation médicale.',
  },
  {
    symptomLabel: 'Douleurs musculaires / Courbatures',
    keywords: [
      'douleur musculaire', 'courbature', 'muscle', 'dos', 'lombaire',
      'douleur dos', 'mal au dos', 'arthrose', 'articulation',
    ],
    searchTerms: ['douleur', 'musculaire', 'arthralgie', 'myalgie'],
    moleculeTerms: ['ibuprofene', 'diclofenac', 'paracetamol', 'naproxene'],
    severity: 'low',
    warningMessage: 'En cas de douleur intense ou traumatisme, consultez un médecin.',
  },
  {
    symptomLabel: 'Toux',
    keywords: [
      'toux', 'je tousse', 'toux seche', 'toux grasse',
      'bronchite', 'gorge', 'expectoration',
    ],
    searchTerms: ['toux', 'bronchite', 'expectorant', 'antitussif'],
    moleculeTerms: ['dextromethorphane', 'codeine', 'carbocisteine', 'bromhexine'],
    severity: 'low',
    warningMessage: 'Une toux persistante de plus de 3 semaines doit être évaluée par un médecin.',
  },
  {
    symptomLabel: 'Nausées / Vomissements',
    keywords: [
      'nausee', 'vomissement', 'envie de vomir', 'j ai la nausee',
      'mal au coeur', 'vomis', 'nausées',
    ],
    searchTerms: ['nausée', 'vomissement', 'antiémétique'],
    moleculeTerms: ['metoclopramide', 'domperidone', 'ondansetron'],
    severity: 'medium',
    warningMessage: 'Des vomissements répétés peuvent entraîner une déshydratation. Consultez si cela persiste.',
  },
  {
    symptomLabel: 'Allergie / Démangeaisons',
    keywords: [
      'allergie', 'demangeaison', 'gratte', 'urticaire', 'prurit',
      'eruption', 'boutons', 'rhinite', 'nez qui coule',
    ],
    searchTerms: ['allergie', 'antihistaminique', 'prurit', 'urticaire'],
    moleculeTerms: ['cetirizine', 'loratadine', 'desloratadine', 'fexofenadine'],
    severity: 'medium',
    warningMessage: 'En cas de gonflement du visage ou difficultés à respirer, appelez le 15 immédiatement.',
  },
  {
    symptomLabel: 'Douleurs d\'estomac / Troubles digestifs',
    keywords: [
      'estomac', 'ventre', 'mal au ventre', 'digestion', 'diarrhee',
      'constipation', 'brulure estomac', 'reflux', 'ballonnement',
    ],
    searchTerms: ['gastrite', 'diarrhée', 'constipation', 'reflux', 'dyspepsie'],
    moleculeTerms: ['omeprazole', 'loperamide', 'bisacodyl', 'simethicone'],
    severity: 'low',
    warningMessage: 'Des douleurs abdominales sévères ou du sang dans les selles nécessitent une consultation urgente.',
  },
  {
    symptomLabel: 'Insomnie / Troubles du sommeil',
    keywords: [
      'insomnie', 'dors pas', 'je ne dors pas', 'sommeil',
      'nuit difficile', 'anxiete', 'stress', 'endormir',
    ],
    searchTerms: ['insomnie', 'anxiété', 'trouble du sommeil'],
    moleculeTerms: ['melatonine', 'valeriane', 'doxylamine'],
    severity: 'low',
    warningMessage: 'Les somnifères ne doivent pas être pris sur une longue période sans avis médical.',
  },
  {
    symptomLabel: 'Infection / Mal de gorge',
    keywords: [
      'gorge', 'mal de gorge', 'angine', 'amygdale', 'avaler',
      'infection', 'rouge', 'gonfle',
    ],
    searchTerms: ['angine', 'pharyngite', 'infection', 'gorge'],
    moleculeTerms: ['amoxicilline', 'paracetamol', 'benzydamine', 'cetylpyridinium'],
    severity: 'medium',
    warningMessage: 'Une angine bactérienne nécessite des antibiotiques prescrits par un médecin.',
  },
  {
    symptomLabel: 'Hypertension / Tension artérielle',
    keywords: [
      'tension', 'hypertension', 'pression', 'coeur', 'palpitation',
      'vertige', 'tete qui tourne',
    ],
    searchTerms: ['hypertension', 'antihypertenseur', 'tension'],
    moleculeTerms: ['amlodipine', 'ramipril', 'losartan', 'bisoprolol'],
    severity: 'high',
    warningMessage: '⚠️ L\'hypertension est une maladie sérieuse. Consultez impérativement un médecin.',
  },
  {
    symptomLabel: 'Diabète / Glycémie',
    keywords: [
      'diabete', 'glycemie', 'sucre', 'insuline', 'soif excessive',
      'urines frequentes',
    ],
    searchTerms: ['diabète', 'hyperglycémie', 'antidiabétique'],
    moleculeTerms: ['metformine', 'glibenclamide', 'insuline'],
    severity: 'high',
    warningMessage: '⚠️ Le diabète nécessite un suivi médical strict. Ces suggestions sont indicatives uniquement.',
  },
  {
    symptomLabel: 'Douleurs menstruelles',
    keywords: [
      'regles', 'menstruation', 'douleur regles', 'crampe', 'cycle',
      'dysmenorrhee',
    ],
    searchTerms: ['dysménorrhée', 'menstruation', 'douleur pelvienne'],
    moleculeTerms: ['ibuprofene', 'naproxene', 'paracetamol'],
    severity: 'low',
    warningMessage: 'Des douleurs menstruelles très intenses peuvent indiquer une endométriose. Consultez un gynécologue.',
  },
];

/**
 * Normalise le texte : minuscules, suppression des accents et ponctuation
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Détecte les symptômes dans la description libre du patient
 */
export function detectSymptoms(description: string): SymptomMapping[] {
  const normalized = normalizeText(description);
  const detected: SymptomMapping[] = [];

  for (const mapping of SYMPTOM_MAPPINGS) {
    const matched = mapping.keywords.some(kw =>
      normalized.includes(normalizeText(kw))
    );
    if (matched) detected.push(mapping);
  }

  return detected;
}
