// src/models/Character.ts

export interface Attributes {
  force: number;
  dexterite: number;
  constitution: number;
  intelligence: number;
  sagesse: number;
  charisme: number;
}

export interface Race {
  id: string;
  nom: string;
  description?: string;
  attributeBonuses: Partial<Attributes>;
  taille: 'Petite' | 'Moyenne' | 'Grande';
  vitesse: number;
  languesBonus?: number;
  competencesBonus?: number;
  donsRaciaux?: string[]; // IDs des dons raciaux
  modificateursSpeciaux?: {
    resistanceSort?: number;
    visionNocturne?: boolean;
    visionInfra?: boolean;
    bonusCompetences?: { [competence: string]: number };
  };
  solaruneCustom?: boolean; // Flag pour les races custom Solarune
}

export interface ClassProgression {
  niveau: number;
  pointsVie: number;
  bonusAttaqueBase: number;
  jetsSauvegarde: {
    vigueur: number;
    reflexes: number;
    volonte: number;
  };
  dons?: string[]; // Dons de classe automatiques
  competencesParNiveau: number;
  capacitesSpeciales?: string[];
}

export interface CharacterClass {
  id: string;
  nom: string;
  description?: string;
  desVie: 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
  competencesPrincipales: string[];
  armesAutorisees: string[];
  armuresAutorisees: string[];
  progression: ClassProgression[];
  lanceurDeSorts?: {
    type: 'arcane' | 'divine';
    attribut: keyof Attributes;
    sortsParJour: { [niveau: number]: number[] }; // [niveau de sort] = nombre par jour
  };
  solaruneCustom?: boolean; // Flag pour les classes custom Solarune
}

export interface CharacterLevel {
  niveau: number;
  classe: string; // ID de la classe
  pointsVieGagnes: number;
  competencesAmeliorees: { [competence: string]: number };
  pointsCompetencesNonDepenses?: number; // Points de compétences non utilisés à ce niveau
  donsChoisis: string[]; // Dons choisis par le joueur
  donsAutomatiques?: string[]; // Dons automatiques de classe (maniement, port d'armure, etc.)
  sortsAppris?: string[];
  attributAugmente?: keyof Attributes; // Tous les 4 niveaux
}

export interface Character {
  id: string;
  nom: string;
  race: string; // ID de la race
  
  // Attributs de base (avant modificateurs raciaux et d'objets)
  attributsBase: Attributes;
  
  // Progression par niveau (jusqu'à 30)
  niveaux: CharacterLevel[];
  
  // Informations dérivées (calculées)
  niveauTotal: number;
  pointsVieTotal: number;
  bonusAttaqueBase: number;
  jetsSauvegardeFinaux: {
    vigueur: number;
    reflexes: number;
    volonte: number;
  };
  
  // Compétences (total des points investis)
  competences: { [competence: string]: number };
  
  // Équipement et objets magiques
  equipement?: {
    armes?: any[];
    armures?: any[];
    objets?: any[];
  };
  
  // Métadonnées
  description?: string;
  histoire?: string;
  alignement?: string;
  dateCreation: Date;
  derniereModification: Date;
  
  // Flag pour indiquer si le personnage utilise du contenu custom Solarune
  utiliseSolaruneContent?: boolean;
  
  // Version pour compatibilité future
  version: string;
}

// Interface pour la validation des builds
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Interface pour les templates de build
export interface BuildTemplate {
  id: string;
  nom: string;
  description: string;
  race: string;
  classes: Array<{
    classe: string;
    niveaux: number;
  }>;
  attributsSuggeres: Attributes;
  donsRecommandes: string[];
  tags: string[];
  auteur?: string;
  popularite?: number;
}
