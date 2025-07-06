// src/utils/automaticFeats.ts

import type { ClassNWN } from '../models/ClassNWN';
import type { Character } from '../models/Character';

/**
 * Mapping des proficiencies vers les dons correspondants
 */
export const PROFICIENCY_TO_FEATS = {
  weapons: {
    simple: 'maniement_des_armes_simples',
    martial: 'maniement_des_armes_martiales',
    exotic: 'maniement_des_armes_exotiques'
  },
  armor: {
    light: 'port_d_armure_legere',
    medium: 'port_d_armure_intermediaire',
    heavy: 'port_d_armure_lourde'
  },
  shields: 'maniement_du_bouclier'
};

/**
 * Détermine les dons automatiques qu'une classe doit accorder
 */
export function getAutomaticFeatsForClass(classData: ClassNWN): string[] {
  const automaticFeats: string[] = [];
  
  if (!classData.proficiencies) return automaticFeats;
  
  // Dons d'armes
  if (classData.proficiencies.weapons) {
    classData.proficiencies.weapons.forEach(weaponType => {
      const featId = PROFICIENCY_TO_FEATS.weapons[weaponType as keyof typeof PROFICIENCY_TO_FEATS.weapons];
      if (featId && !automaticFeats.includes(featId)) {
        automaticFeats.push(featId);
      }
    });
  }
  
  // Dons d'armures
  if (classData.proficiencies.armor) {
    classData.proficiencies.armor.forEach(armorType => {
      const featId = PROFICIENCY_TO_FEATS.armor[armorType as keyof typeof PROFICIENCY_TO_FEATS.armor];
      if (featId && !automaticFeats.includes(featId)) {
        automaticFeats.push(featId);
      }
    });
  }
  
  // Don de bouclier
  if (classData.proficiencies.shields) {
    automaticFeats.push(PROFICIENCY_TO_FEATS.shields);
  }
  
  return automaticFeats;
}

/**
 * Détermine tous les dons automatiques qu'un personnage devrait avoir
 * basé sur ses niveaux de classe
 */
export function getAllAutomaticFeatsForCharacter(character: Character, allClasses: ClassNWN[]): string[] {
  const automaticFeats = new Set<string>();
  
  // Tous les personnages ont les armes simples par défaut (sauf exceptions)
  const classesWithoutSimpleWeapons = ['druid', 'monk', 'rogue', 'wizard'];
  const hasClassWithoutSimpleWeapons = character.niveaux.some(niveau => 
    classesWithoutSimpleWeapons.includes(niveau.classe)
  );
  
  if (!hasClassWithoutSimpleWeapons) {
    automaticFeats.add('maniement_des_armes_simples');
  }
  
  // Parcourir tous les niveaux de classe
  character.niveaux.forEach(niveau => {
    const classData = allClasses.find(c => c.id === niveau.classe);
    if (classData) {
      const classFeats = getAutomaticFeatsForClass(classData);
      classFeats.forEach(feat => automaticFeats.add(feat));
    }
  });
  
  return Array.from(automaticFeats);
}

/**
 * Vérifie si un personnage a tous les dons automatiques requis
 * et retourne ceux qui manquent
 */
export function getMissingAutomaticFeats(character: Character, allClasses: ClassNWN[]): string[] {
  const requiredFeats = getAllAutomaticFeatsForCharacter(character, allClasses);
  const currentFeats = new Set<string>();
  
  // Collecter tous les dons automatiques actuels du personnage
  character.niveaux.forEach(niveau => {
    if (niveau.donsAutomatiques) {
      niveau.donsAutomatiques.forEach(feat => currentFeats.add(feat));
    }
  });
  
  // Retourner les dons manquants
  return requiredFeats.filter(feat => !currentFeats.has(feat));
}

/**
 * Ajoute automatiquement les dons manquants à un personnage
 * Les ajoute dans le champ donsAutomatiques du niveau approprié
 */
export function addMissingAutomaticFeats(character: Character, allClasses: ClassNWN[]): Character {
  const missingFeats = getMissingAutomaticFeats(character, allClasses);
  
  if (missingFeats.length === 0) {
    return character;
  }
  
  // Créer une copie du personnage
  const updatedCharacter = { ...character };
  updatedCharacter.niveaux = character.niveaux.map(niveau => ({ ...niveau }));
  
  // Ajouter les dons manquants au niveau 1 dans donsAutomatiques
  if (updatedCharacter.niveaux.length > 0) {
    const level1 = updatedCharacter.niveaux[0];
    if (!level1.donsAutomatiques) {
      level1.donsAutomatiques = [];
    }
    
    missingFeats.forEach(featId => {
      if (!level1.donsAutomatiques!.includes(featId)) {
        level1.donsAutomatiques!.push(featId);
      }
    });
  }
  
  return updatedCharacter;
}
