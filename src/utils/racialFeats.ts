// src/utils/racialFeats.ts
import type { Character } from '../models/Character';
import { ALL_RACES } from '../data/races';

/**
 * Obtient les dons raciaux pour un personnage donné
 */
export function getRacialFeats(character: Character): string[] {
  const race = ALL_RACES.find(r => r.id === character.race);
  return race?.donsRaciaux || [];
}

/**
 * Vérifie si un personnage a droit à un don bonus racial (humain niveau 1)
 */
export function hasRacialBonusFeat(character: Character): boolean {
  const race = ALL_RACES.find(r => r.id === character.race);
  return race?.id === 'humain' && character.niveauTotal >= 1;
}

/**
 * Applique les dons raciaux automatiques au personnage
 * Doit être appelé lors de la création/modification du personnage
 */
export function applyRacialFeats(character: Character): Character {
  const race = ALL_RACES.find(r => r.id === character.race);
  if (!race || !race.donsRaciaux) return character;

  // Créer une copie du personnage
  const updatedCharacter = { ...character };
  
  // S'assurer qu'il y a au moins un niveau
  if (updatedCharacter.niveaux.length === 0) return updatedCharacter;

  // Appliquer les dons raciaux au premier niveau
  const firstLevel = { ...updatedCharacter.niveaux[0] };
  
  // Initialiser les dons automatiques si nécessaire
  if (!firstLevel.donsAutomatiques) {
    firstLevel.donsAutomatiques = [];
  }

  // Ajouter les dons raciaux aux dons automatiques (sans doublons)
  race.donsRaciaux.forEach(featId => {
    if (!firstLevel.donsAutomatiques!.includes(featId)) {
      firstLevel.donsAutomatiques!.push(featId);
    }
  });

  // Gestion spéciale pour le don bonus humain
  if (race.id === 'humain') {
    // L'humain obtient un slot de don général supplémentaire au niveau 1
    // Ce sera géré dans le hook useFeats en ajoutant un slot spécial
  }

  // Mettre à jour le premier niveau
  updatedCharacter.niveaux[0] = firstLevel;

  return updatedCharacter;
}

/**
 * Calcule le nombre de slots de dons supplémentaires dus aux bonus raciaux
 */
export function getRacialBonusFeatSlots(character: Character): Array<{ level: number; type: 'general' | 'bonus'; source: string }> {
  const race = ALL_RACES.find(r => r.id === character.race);
  const slots = [];

  if (race?.id === 'humain' && character.niveauTotal >= 1) {
    slots.push({
      level: 1,
      type: 'general' as const,
      source: 'racial_human'
    });
  }

  return slots;
}
