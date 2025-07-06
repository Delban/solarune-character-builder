// src/utils/skillCalculations.ts
import type { Character, Attributes } from '../models/Character';
import type { Skill, SkillCalculation, SkillPointsInfo } from '../models/Skills';
import { BASE_SKILLS } from '../models/Skills';
import { getFinalAttributes, getAttributeModifier } from './characterCalculations';
import { allClasses } from '../data';

/**
 * Calcule les points de compétences disponibles pour un niveau donné
 */
export function calculateSkillPointsForLevel(
  character: Character,
  level: number
): SkillPointsInfo {
  const levelData = character.niveaux[level - 1];
  if (!levelData) {
    throw new Error(`Niveau ${level} non trouvé pour le personnage`);
  }

  const classData = allClasses.find(c => c.id === levelData.classe);
  if (!classData) {
    throw new Error(`Classe ${levelData.classe} non trouvée`);
  }

  const finalAttributes = getFinalAttributes(character);
  const intModifier = getAttributeModifier(finalAttributes.intelligence);
  
  // Points de base de la classe
  const basePoints = classData.skill_points || 2;
  
  // Points totaux = base + modificateur Int (minimum 1)
  let totalPoints = Math.max(1, basePoints + intModifier);
  
  // Les humains obtiennent +1 point de compétence par niveau
  if (character.race === 'humain') {
    totalPoints += 1;
  }
  
  // Quadrupler au niveau 1
  const isFirstLevel = level === 1;
  if (isFirstLevel) {
    totalPoints *= 4;
  }
  
  // Calculer les points dépensés à ce niveau
  const spentPoints = calculateSpentPointsAtLevel(character, level);
  
  return {
    basePoints,
    intModifier,
    totalPoints,
    spentPoints,
    remainingPoints: totalPoints - spentPoints,
    isFirstLevel
  };
}

/**
 * Calcule les points dépensés à un niveau donné
 */
export function calculateSpentPointsAtLevel(
  character: Character,
  level: number
): number {
  const levelData = character.niveaux[level - 1];
  if (!levelData) return 0;

  let totalSpent = 0;
  
  // Calculer le coût de chaque amélioration de compétence à ce niveau
  Object.entries(levelData.competencesAmeliorees).forEach(([skillId, ranksAdded]) => {
    if (ranksAdded > 0) {
      const isClassSkill = isSkillClassSkill(skillId, levelData.classe);
      const costPerRank = isClassSkill ? 1 : 2;
      totalSpent += ranksAdded * costPerRank;
    }
  });
  
  return totalSpent;
}

/**
 * Vérifie si une compétence est une compétence de classe
 */
export function isSkillClassSkill(skillId: string, classId: string): boolean {
  const classData = allClasses.find(c => c.id === classId);
  if (!classData || !classData.skills) return false;
  
  return classData.skills.includes(skillId);
}

/**
 * Calcule les rangs totaux d'une compétence pour un personnage
 */
export function getTotalSkillRanks(character: Character, skillId: string): number {
  let totalRanks = 0;
  
  character.niveaux.forEach(level => {
    const ranksAtLevel = level.competencesAmeliorees[skillId] || 0;
    totalRanks += ranksAtLevel;
  });
  
  return totalRanks;
}

/**
 * Calcule le modificateur total d'une compétence (rangs + attribut + bonus raciaux)
 */
export function calculateSkillModifier(
  character: Character,
  skill: Skill
): number {
  const totalRanks = getTotalSkillRanks(character, skill.id);
  const finalAttributes = getFinalAttributes(character);
  const attributeModifier = getAttributeModifier(finalAttributes[skill.attributPrincipal]);
  
  // TODO: Ajouter les bonus raciaux et d'objets magiques ici
  let racialBonus = 0;
  
  return totalRanks + attributeModifier + racialBonus;
}

/**
 * Calcule les informations détaillées pour une compétence
 */
export function calculateSkillInfo(
  character: Character,
  skill: Skill,
  targetLevel: number
): SkillCalculation {
  const currentRanks = getTotalSkillRanks(character, skill.id);
  const levelData = character.niveaux[targetLevel - 1];
  
  if (!levelData) {
    throw new Error(`Niveau ${targetLevel} non trouvé`);
  }
  
  const isClassSkill = isSkillClassSkill(skill.id, levelData.classe);
  const costPerRank = isClassSkill ? 1 : 2;
  
  // Calcul des rangs maximum
  const characterLevel = character.niveauTotal;
  const maxRanks = isClassSkill 
    ? characterLevel + 3 
    : Math.floor((characterLevel + 3) / 2);
  
  // Vérifier si on peut augmenter cette compétence
  const canIncrease = currentRanks < maxRanks;
  
  // Coût total pour passer au rang suivant
  const totalCost = costPerRank;
  
  // Modificateur total
  const modifier = calculateSkillModifier(character, skill);
  
  return {
    currentRanks,
    maxRanks,
    isClassSkill,
    costPerRank,
    totalCost,
    canIncrease,
    modifier
  };
}

/**
 * Vérifie si un personnage peut dépenser des points de compétences à un niveau
 */
export function canSpendSkillPoints(
  character: Character,
  skillId: string,
  pointsToSpend: number,
  level: number
): { canSpend: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const skill = BASE_SKILLS.find(s => s.id === skillId);
  
  if (!skill) {
    reasons.push('Compétence non trouvée');
    return { canSpend: false, reasons };
  }
  
  const skillInfo = calculateSkillInfo(character, skill, level);
  const pointsInfo = calculateSkillPointsForLevel(character, level);
  
  // Vérifier les rangs maximum
  if (skillInfo.currentRanks >= skillInfo.maxRanks) {
    reasons.push(`Rangs maximum atteints (${skillInfo.maxRanks})`);
  }
  
  // Vérifier les points disponibles
  const costRequired = pointsToSpend * skillInfo.costPerRank;
  if (costRequired > pointsInfo.remainingPoints) {
    reasons.push(`Points insuffisants (${costRequired} requis, ${pointsInfo.remainingPoints} disponibles)`);
  }
  
  // Vérifier que la compétence nécessite une formation
  if (skill.formation && skillInfo.currentRanks === 0 && !skillInfo.isClassSkill) {
    reasons.push('Cette compétence nécessite une formation (compétence de classe requise)');
  }
  
  return {
    canSpend: reasons.length === 0,
    reasons
  };
}

/**
 * Calcule tous les points de compétences non dépensés du personnage
 */
export function calculateAllUnspentSkillPoints(character: Character): { [level: number]: number } {
  const unspentPoints: { [level: number]: number } = {};
  
  for (let level = 1; level <= character.niveauTotal; level++) {
    const pointsInfo = calculateSkillPointsForLevel(character, level);
    unspentPoints[level] = pointsInfo.remainingPoints;
  }
  
  return unspentPoints;
}

/**
 * Obtient un résumé des compétences du personnage
 */
export function getSkillSummary(character: Character): Array<{
  skill: Skill;
  totalRanks: number;
  modifier: number;
  isClassSkillAnywhere: boolean;
}> {
  return BASE_SKILLS.map(skill => {
    const totalRanks = getTotalSkillRanks(character, skill.id);
    const modifier = calculateSkillModifier(character, skill);
    
    // Vérifier si c'est une compétence de classe pour au moins une des classes du personnage
    const isClassSkillAnywhere = character.niveaux.some(level => 
      isSkillClassSkill(skill.id, level.classe)
    );
    
    return {
      skill,
      totalRanks,
      modifier,
      isClassSkillAnywhere
    };
  }).filter(item => item.totalRanks > 0 || item.isClassSkillAnywhere);
}
