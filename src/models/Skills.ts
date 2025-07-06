// src/models/Skills.ts

export interface Skill {
  id: string;
  nom: string;
  attributPrincipal: 'force' | 'dexterite' | 'constitution' | 'intelligence' | 'sagesse' | 'charisme';
  description?: string;
  utilisationEnCombat?: boolean;
  armureAppliquee?: boolean; // Si le malus d'armure s'applique
  formation?: boolean; // Si la compétence nécessite une formation
  solaruneCustom?: boolean;
}

/**
 * Interface pour les rangs de compétences d'un personnage
 */
export interface SkillRanks {
  [skillId: string]: number; // skillId -> nombre de rangs
}

/**
 * Interface pour les points de compétences non dépensés par niveau
 */
export interface UnspentSkillPoints {
  [level: number]: number; // niveau -> points non dépensés
}

/**
 * Interface pour calculer les coûts et limites des compétences
 */
export interface SkillCalculation {
  currentRanks: number;
  maxRanks: number;
  isClassSkill: boolean;
  costPerRank: number; // 1 pour classe, 2 pour hors-classe
  totalCost: number;
  canIncrease: boolean;
  modifier: number; // Modificateur d'attribut + rangs
}

/**
 * Interface pour les points de compétences disponibles à un niveau
 */
export interface SkillPointsInfo {
  basePoints: number; // Points de base de la classe
  intModifier: number; // Modificateur d'Intelligence
  totalPoints: number; // Total disponible (incluant quadruple au niveau 1)
  spentPoints: number; // Points déjà dépensés
  remainingPoints: number; // Points restants
  isFirstLevel: boolean; // Si c'est le niveau 1 (quadruple)
}

// Compétences de base NWN
export const BASE_SKILLS: Skill[] = [
  {
    id: 'alchimie',
    nom: 'Alchimie',
    attributPrincipal: 'intelligence',
    formation: true
  },
  {
    id: 'bluff',
    nom: 'Bluff',
    attributPrincipal: 'charisme'
  },
  {
    id: 'concentration',
    nom: 'Concentration',
    attributPrincipal: 'constitution'
  },
  {
    id: 'creation_armure',
    nom: 'Création d\'armure',
    attributPrincipal: 'intelligence',
    formation: true
  },
  {
    id: 'creation_arme',
    nom: 'Création d\'arme',
    attributPrincipal: 'intelligence',
    formation: true
  },
  {
    id: 'creation_piege',
    nom: 'Création de piège',
    attributPrincipal: 'intelligence',
    formation: true
  },
  {
    id: 'diplomatie',
    nom: 'Diplomatie',
    attributPrincipal: 'charisme'
  },
  {
    id: 'discipline',
    nom: 'Discipline',
    attributPrincipal: 'force'
  },
  {
    id: 'discretion',
    nom: 'Discrétion',
    attributPrincipal: 'dexterite',
    armureAppliquee: true
  },
  {
    id: 'dressage',
    nom: 'Dressage',
    attributPrincipal: 'charisme',
    formation: true
  },
  {
    id: 'esquive',
    nom: 'Esquive',
    attributPrincipal: 'dexterite',
    armureAppliquee: true
  },
  {
    id: 'intimidation',
    nom: 'Intimidation',
    attributPrincipal: 'charisme'
  },
  {
    id: 'parade',
    nom: 'Parade',
    attributPrincipal: 'dexterite'
  },
  {
    id: 'perception_auditive',
    nom: 'Perception auditive',
    attributPrincipal: 'sagesse'
  },
  {
    id: 'perception_visuelle',
    nom: 'Perception visuelle',
    attributPrincipal: 'sagesse'
  },
  {
    id: 'persuasion',
    nom: 'Persuasion',
    attributPrincipal: 'charisme'
  },
  {
    id: 'premiers_secours',
    nom: 'Premiers secours',
    attributPrincipal: 'sagesse'
  },
  {
    id: 'raillerie',
    nom: 'Raillerie',
    attributPrincipal: 'charisme'
  },
  {
    id: 'recherche',
    nom: 'Recherche',
    attributPrincipal: 'intelligence'
  },
  {
    id: 'savoir',
    nom: 'Savoir',
    attributPrincipal: 'intelligence',
    formation: true
  },
  {
    id: 'survie',
    nom: 'Survie',
    attributPrincipal: 'sagesse'
  },
  {
    id: 'utilisation_objets_magiques',
    nom: 'Utilisation d\'objets magiques',
    attributPrincipal: 'charisme',
    formation: true
  }
];
