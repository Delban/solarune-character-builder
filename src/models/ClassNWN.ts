// src/models/ClassNWN.ts

export interface SpellcastingInfo {
  type: 'arcane' | 'divine';
  ability: 'intelligence' | 'wisdom' | 'charisma';
  preparation: 'prepared' | 'spontaneous';
  spell_failure: boolean;
  cantrips?: number;
  domain_spells?: boolean;
  start_level?: number;
  school_specialization?: boolean;
}

export interface Proficiencies {
  weapons: string[];
  armor: string[];
  shields: boolean;
  tower_shields?: boolean;
  restrictions?: string[];
}

export interface Requirements {
  base_attack_bonus?: number;
  feats?: string[];
  race?: string[];
  spellcasting?: string;
  alignment?: string;
  skills?: { [skillName: string]: number };
}

export interface LevelProgression {
  level: number;
  bab: number;
  saves: {
    fort: number;
    ref: number;
    will: number;
  };
  features: string[];
  hp_range: [number, number];
  spells_per_day?: { [level: string]: number };
  spells_known?: { [level: string]: number };
}

export interface ClassNWN {
  id: string;
  nom: string;
  description: string;
  type: 'base' | 'prestige';
  hit_die: string;
  skill_points: number;
  skill_modifier: string;
  proficiencies: Proficiencies;
  skills: string[];
  primary_saves: string[];
  base_attack_bonus: 'full' | 'medium' | 'low';
  spellcasting: SpellcastingInfo | null;
  alignment_restriction: string | null;
  requirements: Requirements;
  unavailable_feats: string[];
  progression: LevelProgression[];
}

// Utilitaires pour le calcul du BAB
export function calculateBABProgression(classType: 'full' | 'medium' | 'low', level: number): number {
  switch (classType) {
    case 'full':
      return level;
    case 'medium':
      return Math.floor(level * 0.75);
    case 'low':
      return Math.floor(level * 0.5);
    default:
      return 0;
  }
}

// Utilitaires pour les jets de sauvegarde
export function calculateSaveProgression(saveType: 'good' | 'poor', level: number): number {
  if (saveType === 'good') {
    return 2 + Math.floor(level / 2);
  } else {
    return Math.floor(level / 3);
  }
}

// Mapping des progressions de saves par classe
export const CLASS_SAVE_PROGRESSIONS: { [classId: string]: { fort: 'good' | 'poor', ref: 'good' | 'poor', will: 'good' | 'poor' } } = {
  barbarian: { fort: 'good', ref: 'poor', will: 'poor' },
  bard: { fort: 'poor', ref: 'good', will: 'good' },
  cleric: { fort: 'good', ref: 'poor', will: 'good' },
  druid: { fort: 'good', ref: 'poor', will: 'good' },
  fighter: { fort: 'good', ref: 'poor', will: 'poor' },
  monk: { fort: 'good', ref: 'good', will: 'good' },
  paladin: { fort: 'good', ref: 'poor', will: 'poor' },
  ranger: { fort: 'good', ref: 'good', will: 'poor' },
  rogue: { fort: 'poor', ref: 'good', will: 'poor' },
  sorcerer: { fort: 'poor', ref: 'poor', will: 'good' },
  wizard: { fort: 'poor', ref: 'poor', will: 'good' },
  // Classes de prestige
  arcane_archer: { fort: 'good', ref: 'good', will: 'poor' },
  assassin: { fort: 'poor', ref: 'good', will: 'poor' }
};
