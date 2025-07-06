// src/utils/characterCalculations.ts
import type { Character, Attributes, ValidationResult } from '../models/Character';
import type { Skill } from '../models/Skills';
import { ALL_RACES } from '../data/races';
import { BASE_SKILLS } from '../models/Skills';
import classesNWN from '../data/classesNWN.json';

// Calculs des modificateurs d'attributs
export function getAttributeModifier(attributeValue: number): number {
  return Math.floor((attributeValue - 10) / 2);
}

// Calcul des attributs finaux (base + racial + objets)
export function getFinalAttributes(character: Character): Attributes {
  const race = ALL_RACES.find(r => r.id === character.race);
  const racialBonuses = race?.attributeBonuses || {};
  
  return {
    force: character.attributsBase.force + (racialBonuses.force || 0),
    dexterite: character.attributsBase.dexterite + (racialBonuses.dexterite || 0),
    constitution: character.attributsBase.constitution + (racialBonuses.constitution || 0),
    intelligence: character.attributsBase.intelligence + (racialBonuses.intelligence || 0),
    sagesse: character.attributsBase.sagesse + (racialBonuses.sagesse || 0),
    charisme: character.attributsBase.charisme + (racialBonuses.charisme || 0)
  };
}

// Calcul du total de points de vie
export function calculateTotalHitPoints(character: Character): number {
  const finalAttributes = getFinalAttributes(character);
  const conModifier = getAttributeModifier(finalAttributes.constitution);
  
  let totalHP = 0;
  
  character.niveaux.forEach(level => {
    totalHP += level.pointsVieGagnes + conModifier;
  });
  
  return Math.max(totalHP, character.niveaux.length); // Minimum 1 PV par niveau
}

// Calcul du bonus d'attaque de base total
export function calculateBaseAttackBonus(character: Character): number {
  let totalBAB = 0;
  
  character.niveaux.forEach(level => {
    const classData = (classesNWN as any[]).find(c => c.id === level.classe);
    
    if (classData) {
      // Utiliser la progression définie dans les données de classe
      switch (classData.base_attack_bonus) {
        case 'full':
          totalBAB += 1;
          break;
        case 'medium':
          totalBAB += 0.75;
          break;
        case 'low':
          totalBAB += 0.5;
          break;
        default:
          totalBAB += 0.75; // Fallback vers medium
      }
    } else {
      // Fallback vers l'ancien système si la classe n'est pas trouvée
      const attackProgressions: { [key: string]: 'full' | 'medium' | 'low' } = {
        // Progression complète (BAB = niveau)
        'guerrier': 'full',
        'fighter': 'full',
        'paladin': 'full',
        'ranger': 'full',
        'rodeur': 'full',
        'barbarian': 'full',
        'barbare': 'full',
        
        // Progression moyenne (BAB = 3/4 niveau)
        'clerc': 'medium',
        'cleric': 'medium',
        'druide': 'medium',
        'druid': 'medium',
        'moine': 'medium',
        'monk': 'medium',
        'roublard': 'medium',
        'rogue': 'medium',
        'barde': 'medium',
        'bard': 'medium',
        
        // Progression faible (BAB = 1/2 niveau)
        'magicien': 'low',
        'wizard': 'low',
        'ensorceleur': 'low',
        'sorcerer': 'low'
      };
      
      const progression = attackProgressions[level.classe] || 'medium';
      
      switch (progression) {
        case 'full':
          totalBAB += 1;
          break;
        case 'medium':
          totalBAB += 0.75;
          break;
        case 'low':
          totalBAB += 0.5;
          break;
      }
    }
  });
  
  return Math.floor(totalBAB);
}

// Validation de la répartition des attributs (système point-buy)
export function validateAttributeAllocation(attributes: Attributes, pointBuyBudget: number = 32): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier que tous les attributs sont dans la plage valide (8-18 avant racial)
  Object.entries(attributes).forEach(([attr, value]) => {
    if (value < 8) {
      errors.push(`${attr}: La valeur minimum est 8 (actuel: ${value})`);
    }
    if (value > 18) {
      errors.push(`${attr}: La valeur maximum avant bonus raciaux est 18 (actuel: ${value})`);
    }
  });
  
  // Calculer le coût en points
  const pointCost = calculatePointBuyCost(attributes);
  if (pointCost > pointBuyBudget) {
    errors.push(`Coût en points trop élevé: ${pointCost}/${pointBuyBudget}`);
  }
  
  // Vérifications des stats équilibrées
  const values = Object.values(attributes);
  const maxStat = Math.max(...values);
  const minStat = Math.min(...values);
  
  if (maxStat - minStat > 10) {
    warnings.push('Les attributs semblent très déséquilibrés');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Calcul du coût en points pour l'achat d'attributs
export function calculatePointBuyCost(attributes: Attributes): number {
  const costs: { [key: number]: number } = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 8, 16: 10, 17: 13, 18: 16
  };
  
  return Object.values(attributes).reduce((total, value) => {
    return total + (costs[value] || 0);
  }, 0);
}

// Validation de la progression de personnage
export function validateCharacterProgression(character: Character): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier que le niveau total ne dépasse pas 30
  if (character.niveauTotal > 30) {
    errors.push(`Niveau maximum dépassé: ${character.niveauTotal}/30`);
  }
  
  // Vérifier la cohérence des niveaux
  const expectedLevel = character.niveaux.length;
  if (character.niveauTotal !== expectedLevel) {
    errors.push(`Incohérence de niveau: total=${character.niveauTotal}, niveaux=${expectedLevel}`);
  }
  
  // Vérifier les prérequis des dons
  // (Cette validation nécessiterait l'accès aux données des dons)
  
  // Vérifier les points de compétences
  // (Cette validation nécessiterait l'accès aux données des classes)
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Calcul du modificateur total d'une compétence
export function calculateSkillModifier(
  character: Character, 
  skillId: string, 
  skillData?: Skill
): number {
  const skill = skillData || BASE_SKILLS.find(s => s.id === skillId);
  if (!skill) return 0;
  
  const finalAttributes = getFinalAttributes(character);
  const attributeModifier = getAttributeModifier(finalAttributes[skill.attributPrincipal]);
  const skillRanks = character.competences[skillId] || 0;
  
  // Bonus racial si applicable
  const race = ALL_RACES.find(r => r.id === character.race);
  const racialBonus = race?.modificateursSpeciaux?.bonusCompetences?.[skillId] || 0;
  
  return skillRanks + attributeModifier + racialBonus;
}

// Vérification des points de compétences disponibles par niveau
export function calculateAvailableSkillPoints(character: Character, _level: number): number {
  // Cette fonction nécessiterait les données complètes des classes
  // Pour l'instant, on retourne une valeur basique
  const intelligence = getFinalAttributes(character).intelligence;
  const intModifier = getAttributeModifier(intelligence);
  
  // Base skill points (dépend de la classe) + modificateur d'INT
  const baseSkillPoints = 4; // Approximation, devrait venir des données de classe
  return Math.max(1, baseSkillPoints + intModifier);
}

// Génération d'un personnage de base
export function createBaseCharacter(name: string, raceId: string): Partial<Character> {
  return {
    nom: name,
    race: raceId,
    attributsBase: {
      force: 10,
      dexterite: 10,
      constitution: 10,
      intelligence: 10,
      sagesse: 10,
      charisme: 10
    },
    niveaux: [],
    niveauTotal: 0,
    pointsVieTotal: 0,
    bonusAttaqueBase: 0,
    jetsSauvegardeFinaux: {
      vigueur: 0,
      reflexes: 0,
      volonte: 0
    },
    competences: {},
    dateCreation: new Date(),
    derniereModification: new Date(),
    version: '1.0'
  };
}
