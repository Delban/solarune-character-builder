// src/data/races.ts
import type { Race } from '../models/Character';

export const BASE_RACES: Race[] = [
  {
    id: 'humain',
    nom: 'Humain',
    description: 'Les humains sont la race la plus adaptable et ambitieuse.',
    attributeBonuses: {}, // Aucun bonus fixe
    taille: 'Moyenne',
    vitesse: 30,
    languesBonus: 4,
    competencesBonus: 4,
    donsRaciaux: [], // Les humains n'ont pas de dons raciaux automatiques, mais un slot supplémentaire
    modificateursSpeciaux: {
      bonusCompetences: {} // Les humains peuvent mettre leurs points où ils veulent
    }
  },
  {
    id: 'elfe',
    nom: 'Elfe',
    description: 'Les elfes sont une race gracieuse et magique.',
    attributeBonuses: {
      dexterite: 2,
      constitution: -2
    },
    taille: 'Moyenne',
    vitesse: 30,
    donsRaciaux: ['keen_sense', 'hardiness_vs_enchantments'],
    modificateursSpeciaux: {
      visionNocturne: true,
      bonusCompetences: {
        'perception_auditive': 2,
        'perception_visuelle': 2,
        'recherche': 2
      }
    }
  },
  {
    id: 'nain',
    nom: 'Nain',
    description: 'Les nains sont un peuple robuste et résistant.',
    attributeBonuses: {
      constitution: 2,
      charisme: -2
    },
    taille: 'Moyenne',
    vitesse: 20,
    donsRaciaux: ['darkvision', 'hardiness_vs_poisons', 'hardiness_vs_spells'],
    modificateursSpeciaux: {
      visionInfra: true,
      bonusCompetences: {
        'savoir': 2 // Connaissance de la pierre et du métal
      }
    }
  },
  {
    id: 'halfelin',
    nom: 'Halfelin',
    description: 'Les halfelins sont un peuple petit mais courageux.',
    attributeBonuses: {
      dexterite: 2,
      force: -2
    },
    taille: 'Petite',
    vitesse: 20,
    donsRaciaux: ['good_aim', 'lucky'],
    modificateursSpeciaux: {
      bonusCompetences: {
        'discretion': 4,
        'perception_auditive': 2
      }
    }
  },
  {
    id: 'demi_elfe',
    nom: 'Demi-Elfe',
    description: 'Les demi-elfes combinent la versatilité humaine et la grâce elfique.',
    attributeBonuses: {}, // Peuvent choisir leur bonus
    taille: 'Moyenne',
    vitesse: 30,
    donsRaciaux: ['hardiness_vs_enchantments'],
    modificateursSpeciaux: {
      visionNocturne: true,
      bonusCompetences: {
        'perception_auditive': 1,
        'perception_visuelle': 1,
        'diplomatie': 2,
        'bluff': 2
      }
    }
  },
  {
    id: 'demi_orque',
    nom: 'Demi-Orque',
    description: 'Les demi-orques héritent de la force de leurs ancêtres orques.',
    attributeBonuses: {
      force: 2,
      intelligence: -2,
      charisme: -2
    },
    taille: 'Moyenne',
    vitesse: 30,
    donsRaciaux: [],
    modificateursSpeciaux: {
      visionInfra: true
    }
  },
  {
    id: 'gnome',
    nom: 'Gnome',
    description: 'Les gnomes sont un peuple petit mais ingénieux.',
    attributeBonuses: {
      constitution: 2,
      force: -2
    },
    taille: 'Petite',
    vitesse: 20,
    donsRaciaux: ['small_stature', 'hardiness_vs_illusions'],
    modificateursSpeciaux: {
      visionNocturne: true,
      bonusCompetences: {
        'concentration': 2,
        'savoir': 2,
        'alchimie': 2
      }
    }
  }
];

// Placeholder pour les races custom Solarune
export const SOLARUNE_RACES: Race[] = [
  // Ces races seront ajoutées plus tard avec les données spécifiques à Solarune
  {
    id: 'solarune_example',
    nom: 'Race Custom Solarune',
    description: 'Exemple de race custom pour Solarune',
    attributeBonuses: {},
    taille: 'Moyenne',
    vitesse: 30,
    solaruneCustom: true
  }
];

export const ALL_RACES = [...BASE_RACES, ...SOLARUNE_RACES];
