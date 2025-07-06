// src/hooks/useClassRequirements.ts
import { useMemo } from 'react';
import type { Character } from '../models/Character';
import type { Don } from '../models/Don';

interface ClassRequirements {
  base_attack_bonus?: number;
  skills?: Record<string, number>;
  feats?: string[];
  race?: string[];
  alignment?: string;
  spellcasting_ability?: string;
  spell_level?: number;
  ability_scores?: Record<string, number>;
  special?: string;
  spellcasting?: string;
}

interface ClassData {
  id: string;
  nom: string;
  type: 'base' | 'prestige';
  requirements?: ClassRequirements;
  alignment_restriction?: string;
}

export function useClassRequirements(character: Character, allClasses: ClassData[], allDons: Don[]) {
  return useMemo(() => {
    const checkRequirements = (classData: ClassData): { canTake: boolean; missingRequirements: string[] } => {
      if (classData.type === 'base') {
        return { canTake: true, missingRequirements: [] };
      }

      const requirements = classData.requirements;
      if (!requirements) {
        return { canTake: true, missingRequirements: [] };
      }

      const missing: string[] = [];

      // Vérifier le BAB minimum
      if (requirements.base_attack_bonus) {
        const currentBAB = calculateTotalBAB(character);
        if (currentBAB < requirements.base_attack_bonus) {
          missing.push(`BAB +${requirements.base_attack_bonus} (actuel: +${currentBAB})`);
        }
      }

      // Vérifier les compétences requises
      if (requirements.skills) {
        Object.entries(requirements.skills).forEach(([skill, requiredLevel]) => {
          const currentLevel = getSkillLevel(character, skill);
          if (currentLevel < requiredLevel) {
            missing.push(`${skill} ${requiredLevel} rangs (actuel: ${currentLevel})`);
          }
        });
      }

      // Vérifier les dons requis
      if (requirements.feats) {
        const characterFeats = getAllCharacterFeats(character);
        requirements.feats.forEach(requiredFeat => {
          const hasFeat = characterFeats.some(feat => 
            feat.id === requiredFeat || 
            feat.nom.toLowerCase().includes(requiredFeat.toLowerCase()) ||
            requiredFeat.includes(feat.id)
          );
          if (!hasFeat) {
            missing.push(`Don: ${getHumanReadableFeatName(requiredFeat)}`);
          }
        });
      }

      // Vérifier les caractéristiques minimales
      if (requirements.ability_scores) {
        Object.entries(requirements.ability_scores).forEach(([ability, minValue]) => {
          const currentValue = getAbilityScore(character, ability);
          if (currentValue < minValue) {
            const abilityName = getAbilityName(ability);
            missing.push(`${abilityName} ${minValue}+ (actuel: ${currentValue})`);
          }
        });
      }

      // Vérifier les prérequis spéciaux
      if (requirements.special) {
        if (requirements.special === 'wild_shape_or_polymorph_spell_known') {
          const hasWildShape = character.niveaux.some(niveau => niveau.classe === 'druid');
          const knowsPolymorph = checkKnowsPolymorphSpell(character);
          if (!hasWildShape && !knowsPolymorph) {
            missing.push('Don Forme animale OU Forme spirituelle OU sort Métamorphose connu');
          }
        }
      }

      // Vérifier les prérequis de lancement de sorts
      if (requirements.spellcasting) {
        const canCast = checkSpellcastingRequirement(character, requirements.spellcasting);
        if (!canCast) {
          missing.push(getSpellcastingRequirementText(requirements.spellcasting));
        }
      }

      // Vérifier la race
      if (requirements.race && requirements.race.length > 0) {
        const characterRace = character.race?.toLowerCase() || '';
        const hasValidRace = requirements.race.some(race => 
          characterRace.includes(race.toLowerCase())
        );
        if (!hasValidRace) {
          missing.push(`Race: ${requirements.race.join(' ou ')}`);
        }
      }

      // Vérifier les prérequis spéciaux pour certaines classes de prestige
      if (classData.id === 'pale_master') {
        // Pale Master: doit être capable de lancer des sorts de niveau 3
        // et avoir une spécialisation en nécromancie
        const canCastLevel3 = character.niveauTotal >= 5; // Approximation
        if (!canCastLevel3) {
          missing.push('Capacité de lancer des sorts de niveau 3');
        }
      }

      if (classData.id === 'red_dragon_disciple') {
        // Red Dragon Disciple: doit avoir du sang de dragon (généralement Ensorceleur)
        const hasDragonBlood = character.niveaux.some(niveau => 
          niveau.classe === 'sorcerer' || niveau.classe === 'bard'
        );
        if (!hasDragonBlood) {
          missing.push('Lignée draconique (Ensorceleur ou sorts spontanés)');
        }
        
        // Prérequis: Lore (Connaissances) 8 rangs
        const loreLevel = getSkillLevel(character, 'lore');
        if (loreLevel < 8) {
          missing.push(`Connaissances 8 rangs (actuel: ${loreLevel})`);
        }
        
        // Prérequis: Capacité de lancer des sorts (niveau 1 minimum)
        const canCastSpells = character.niveaux.some(niveau => 
          ['sorcerer', 'wizard', 'bard', 'cleric', 'druid', 'paladin', 'ranger'].includes(niveau.classe)
        );
        if (!canCastSpells) {
          missing.push('Capacité de lancer des sorts (classe de lanceur)');
        }
      }

      if (classData.id === 'shadowdancer') {
        // Shadowdancer: généralement nécessite des compétences de discrétion
        const hasStealthSkills = getSkillLevel(character, 'hide') >= 10 && 
                                 getSkillLevel(character, 'move_silently') >= 8;
        if (!hasStealthSkills) {
          missing.push('Discrétion 10 rangs, Déplacement silencieux 8 rangs');
        }
      }

      // Nouvelles classes de prestige de Solarune
      if (classData.id === 'artificier') {
        const canCastArcane = character.niveaux.some(niveau => 
          ['wizard', 'sorcerer', 'bard'].includes(niveau.classe)
        );
        if (!canCastArcane) {
          missing.push('Capacité de lancer des sorts profanes');
        }
      }

      if (classData.id === 'chasseur nocturne' || classData.id === 'chasseur_nocturne') {
        const alignment = character.alignement?.toLowerCase() || '';
        if (alignment.includes('bon') || alignment.includes('good')) {
          missing.push('Alignement: ne peut pas être bon');
        }
        
        const hideLevel = getSkillLevel(character, 'hide');
        const moveSilentlyLevel = getSkillLevel(character, 'move_silently');
        const loreLevel = getSkillLevel(character, 'lore');
        
        if (hideLevel < 8) {
          missing.push(`Discrétion 8 rangs (actuel: ${hideLevel})`);
        }
        if (moveSilentlyLevel < 8) {
          missing.push(`Déplacement silencieux 8 rangs (actuel: ${moveSilentlyLevel})`);
        }
        if (loreLevel < 6) {
          missing.push(`Savoir 6 rangs (actuel: ${loreLevel})`);
        }
      }

      if (classData.id === 'chevalier') {
        const alignment = character.alignement?.toLowerCase() || '';
        if (!alignment.includes('loyal') && !alignment.includes('lawful')) {
          missing.push('Alignement: doit être loyal');
        }
        
        const disciplineLevel = getSkillLevel(character, 'discipline');
        if (disciplineLevel < 8) {
          missing.push(`Discipline 8 rangs (actuel: ${disciplineLevel})`);
        }
      }

      if (classData.id === 'danseur de guerre' || classData.id === 'danseur_de_guerre') {
        const alignment = character.alignement?.toLowerCase() || '';
        if (alignment.includes('loyal') || alignment.includes('lawful')) {
          missing.push('Alignement: ne peut pas être loyal');
        }
        
        const acrobaticsLevel = getSkillLevel(character, 'tumble');
        if (acrobaticsLevel < 5) {
          missing.push(`Acrobatie 5 rangs (actuel: ${acrobaticsLevel})`);
        }
      }

      if (classData.id === 'magelame') {
        const canCastLevel3 = character.niveauTotal >= 5 && character.niveaux.some(niveau => 
          ['wizard', 'sorcerer', 'bard'].includes(niveau.classe)
        );
        if (!canCastLevel3) {
          missing.push('Capacité de lancer des sorts profanes de niveau 3');
        }
        
        const concentrationLevel = getSkillLevel(character, 'concentration');
        if (concentrationLevel < 5) {
          missing.push(`Concentration 5 rangs (actuel: ${concentrationLevel})`);
        }
      }

      return {
        canTake: missing.length === 0,
        missingRequirements: missing
      };
    };

    const getCompleteRequirements = (classData: ClassData): string[] => {
      if (classData.type === 'base') {
        return ['Aucun prérequis - Classe de base'];
      }

      const allRequirements: string[] = [];
      const requirements = classData.requirements;

      // Prérequis de base depuis les données JSON
      if (requirements) {
        // BAB requis
        if (requirements.base_attack_bonus) {
          allRequirements.push(`BAB +${requirements.base_attack_bonus}`);
        }

        // Compétences requises
        if (requirements.skills) {
          Object.entries(requirements.skills).forEach(([skill, level]) => {
            allRequirements.push(`${skill} ${level} rangs`);
          });
        }

        // Dons requis
        if (requirements.feats) {
          requirements.feats.forEach(feat => {
            allRequirements.push(`Don: ${getHumanReadableFeatName(feat)}`);
          });
        }

        // Race requise
        if (requirements.race && requirements.race.length > 0) {
          allRequirements.push(`Race: ${requirements.race.join(' ou ')}`);
        }

        // Alignement requis
        if (requirements.alignment && requirements.alignment !== '') {
          allRequirements.push(`Alignement: ${requirements.alignment}`);
        }
      }

      // Prérequis spéciaux codés en dur
      if (classData.id === 'pale_master') {
        allRequirements.push('Capacité de lancer des sorts de niveau 3');
        allRequirements.push('Spécialisation en Nécromancie (recommandé)');
      }

      if (classData.id === 'red_dragon_disciple') {
        allRequirements.push('Lignée draconique (Ensorceleur ou sorts spontanés)');
        allRequirements.push('Connaissances (Lore) 8 rangs');
        allRequirements.push('Capacité de lancer des sorts');
      }

      if (classData.id === 'shadowdancer') {
        allRequirements.push('Discrétion (Hide) 10 rangs');
        allRequirements.push('Déplacement silencieux (Move Silently) 8 rangs');
      }

      if (classData.id === 'shifter') {
        allRequirements.push('Don: Vigilance');
        allRequirements.push('Don: Forme sauvage');
      }

      if (classData.id === 'harper_scout') {
        allRequirements.push('Discipline 4 rangs');
        allRequirements.push('Connaissances (Lore) 6 rangs');
        allRequirements.push('Persuasion 8 rangs');
        allRequirements.push('Fouille (Search) 4 rangs');
        allRequirements.push('Don: Vigilance');
        allRequirements.push('Don: Volonté de fer');
        allRequirements.push('Alignement: Non-mauvais');
      }

      if (classData.id === 'arcane_archer') {
        allRequirements.push('BAB +6');
        allRequirements.push('Don: Spécialisation martiale (Arc)');
        allRequirements.push('Don: Tir à bout portant');
        allRequirements.push('Race: Elfe ou Demi-elfe');
      }

      if (classData.id === 'assassin') {
        allRequirements.push('Discrétion (Hide) 8 rangs');
        allRequirements.push('Déplacement silencieux (Move Silently) 8 rangs');
        allRequirements.push('Alignement: Mauvais uniquement');
      }

      if (classData.id === 'blackguard') {
        allRequirements.push('BAB +6');
        allRequirements.push('Discrétion (Hide) 5 rangs');
        allRequirements.push('Alignement: Mauvais uniquement');
      }

      if (classData.id === 'weapon_master') {
        allRequirements.push('BAB +5');
        allRequirements.push('Don: Expertise du combat');
        allRequirements.push('Don: Esquive');
        allRequirements.push('Don: Mobilité');
        allRequirements.push('Don: Attaque en mouvement');
        allRequirements.push('Don: Attaque tourbillonnante');
        allRequirements.push('Don: Spécialisation martiale (une arme)');
      }

      if (allRequirements.length === 0) {
        allRequirements.push('Prérequis non documentés - Vérifier les sources NWN');
      }

      return allRequirements;
    };

    const classRequirements = new Map<string, { canTake: boolean; missingRequirements: string[] }>();
    
    allClasses.forEach(classData => {
      classRequirements.set(classData.id, checkRequirements(classData));
    });

    return {
      checkRequirements,
      getClassRequirements: (classId: string) => classRequirements.get(classId) || { canTake: true, missingRequirements: [] },
      getAllClassRequirements: () => classRequirements,
      getCompleteRequirements: (classData: ClassData): string[] => {
        if (classData.type === 'base') {
          return [];
        }

        const requirements = classData.requirements;
        if (!requirements) {
          return [];
        }

        const allRequirements: string[] = [];

        // BAB requis
        if (requirements.base_attack_bonus) {
          allRequirements.push(`BAB +${requirements.base_attack_bonus}`);
        }

        // Compétences requises
        if (requirements.skills) {
          Object.entries(requirements.skills).forEach(([skill, requiredLevel]) => {
            allRequirements.push(`${skill} ${requiredLevel} rangs`);
          });
        }

        // Dons requis
        if (requirements.feats) {
          requirements.feats.forEach(requiredFeat => {
            allRequirements.push(`Don: ${getHumanReadableFeatName(requiredFeat)}`);
          });
        }

        // Race requise
        if (requirements.race && requirements.race.length > 0) {
          allRequirements.push(`Race: ${requirements.race.join(' ou ')}`);
        }

        // Alignement requis
        if (classData.alignment_restriction) {
          allRequirements.push(`Alignement: ${classData.alignment_restriction}`);
        }

        // Prérequis spéciaux pour certaines classes de prestige
        if (classData.id === 'pale_master') {
          allRequirements.push('Capacité de lancer des sorts de niveau 3');
          allRequirements.push('Spécialisation en nécromancie recommandée');
        }

        if (classData.id === 'red_dragon_disciple') {
          allRequirements.push('Lignée draconique (Ensorceleur ou sorts spontanés)');
          allRequirements.push('Connaissances 8 rangs');
          allRequirements.push('Capacité de lancer des sorts (classe de lanceur)');
        }

        if (classData.id === 'shadowdancer') {
          allRequirements.push('Discrétion 10 rangs');
          allRequirements.push('Déplacement silencieux 8 rangs');
          allRequirements.push('Don: Esquive');
          allRequirements.push('Don: Mobilité');
        }

        if (classData.id === 'shifter') {
          allRequirements.push('Connaissances (nature) 4 rangs');
          allRequirements.push('Capacité de forme sauvage');
          allRequirements.push('Alignement non-loyal');
        }

        if (classData.id === 'harper_scout') {
          allRequirements.push('Alignement non-mauvais');
          allRequirements.push('Connaissances (local) 4 rangs');
          allRequirements.push('Persuasion 8 rangs');
          allRequirements.push('Fouille 4 rangs');
          allRequirements.push('Un don de Talent au choix');
        }

        if (classData.id === 'arcane_archer') {
          allRequirements.push('BAB +6');
          allRequirements.push('Race: Elfe ou Demi-elfe');
          allRequirements.push('Don: Arme de prédilection (Arc long ou Arc court)');
          allRequirements.push('Don: Tir à bout portant');
          allRequirements.push('Capacité de lancer des sorts de niveau 1');
        }

        if (classData.id === 'assassin') {
          allRequirements.push('Alignement mauvais');
          allRequirements.push('Discrétion 8 rangs');
          allRequirements.push('Déplacement silencieux 8 rangs');
          allRequirements.push('Attaque sournoise +2d6');
        }

        if (classData.id === 'blackguard') {
          allRequirements.push('BAB +6');
          allRequirements.push('Alignement mauvais');
          allRequirements.push('Discrétion 5 rangs');
          allRequirements.push('Intimidation 2 rangs');
          allRequirements.push('Don: Arme de prédilection');
        }

        if (classData.id === 'weapon_master') {
          allRequirements.push('BAB +5');
          allRequirements.push('Don: Arme de prédilection');
          allRequirements.push('Don: Spécialisation martiale');
          allRequirements.push('Intimidation 4 rangs');
        }

        // Nouvelles classes de prestige de Solarune
        if (classData.id === 'artificier') {
          allRequirements.push('Capacité de lancer des sorts profanes');
          allRequirements.push('Connaissances (ingénierie/alchimie) 8 rangs');
          allRequirements.push('Don: Création d\'objets merveilleux');
        }

        if (classData.id === 'chasseur nocturne' || classData.id === 'chasseur_nocturne') {
          allRequirements.push('Alignement: ne pas être bon');
          allRequirements.push('Discrétion 8 rangs');
          allRequirements.push('Déplacement silencieux 8 rangs');
          allRequirements.push('Savoir 6 rangs');
        }

        if (classData.id === 'chevalier') {
          allRequirements.push('BAB +6');
          allRequirements.push('Alignement: loyal');
          allRequirements.push('Discipline 8 rangs');
          allRequirements.push('Détection 3 rangs');
          allRequirements.push('Intimidation 3 rangs');
          allRequirements.push('Perception auditive 3 rangs');
          allRequirements.push('Persuasion 3 rangs');
          allRequirements.push('Don: Vigilance');
          allRequirements.push('Don: Robustesse');
        }

        if (classData.id === 'danseur de guerre' || classData.id === 'danseur_de_guerre') {
          allRequirements.push('BAB +5');
          allRequirements.push('Alignement: non-loyal');
          allRequirements.push('Acrobatie 5 rangs');
          allRequirements.push('Discipline 5 rangs');
          allRequirements.push('Persuasion 5 rangs');
          allRequirements.push('Don: Esquive');
          allRequirements.push('Don: Souplesse du serpent');
        }

        if (classData.id === 'magelame') {
          allRequirements.push('BAB +5');
          allRequirements.push('Acrobatie 5 rangs');
          allRequirements.push('Concentration 5 rangs');
          allRequirements.push('Connaissance des sorts 5 rangs');
          allRequirements.push('Discipline 5 rangs');
          allRequirements.push('Capacité de lancer des sorts profanes de niveau 3');
          allRequirements.push('Don: Expertise du combat');
          allRequirements.push('Don: Incantation statique');
          allRequirements.push('Don: Magie de guerre');
        }

        // Corrections pour les classes renommées
        if (classData.id === 'éclaireur_ménestrel' || classData.id === 'eclaireur_menestrel') {
          allRequirements.push('Alignement: non-mauvais');
          allRequirements.push('Connaissances (local) 4 rangs');
          allRequirements.push('Persuasion 8 rangs');
          allRequirements.push('Fouille 4 rangs');
          allRequirements.push('Un don de Talent au choix');
        }

        if (classData.id === 'métamorphe') {
          allRequirements.push('Connaissances (nature) 4 rangs');
          allRequirements.push('Capacité de forme sauvage');
          allRequirements.push('Alignement: non-loyal');
        }

        return allRequirements;
      }
    };
  }, [character, allClasses, allDons]);
}

// Fonctions utilitaires
function calculateTotalBAB(character: Character): number {
  let totalBAB = 0;
  
  // Calcul plus précis basé sur les classes réelles du personnage
  character.niveaux.forEach(niveau => {
    const classId = niveau.classe;
    
    // BAB en fonction de la classe (approximations D&D 3.5)
    switch (classId) {
      case 'fighter':
      case 'paladin': 
      case 'ranger':
      case 'barbarian':
        totalBAB += 1; // BAB complet
        break;
      case 'cleric':
      case 'druid':
      case 'monk':
      case 'bard':
      case 'rogue':
        totalBAB += 0.75; // BAB moyen
        break;
      case 'wizard':
      case 'sorcerer':
        totalBAB += 0.5; // BAB faible
        break;
      default:
        totalBAB += 0.75; // Défaut moyen
    }
  });
  
  return Math.floor(totalBAB);
}

function getSkillLevel(_character: Character, _skillName: string): number {
  // TODO: Implémenter le système de compétences
  return 0; // Placeholder
}

function getAllCharacterFeats(character: Character): Don[] {
  // Récupérer tous les dons du personnage de tous les niveaux
  const allFeats: Don[] = [];
  
  character.niveaux.forEach(niveau => {
    if (niveau.donsChoisis) {
      // TODO: Convertir les IDs de dons en objets Don
      // Pour le moment, on retourne une liste vide
    }
  });
  
  return allFeats;
}

function getHumanReadableFeatName(featId: string): string {
  // Convertir les IDs de dons en noms lisibles français
  const featNameMap: Record<string, string> = {
    // Archery feats
    'weapon_focus_longbow': 'Arme de prédilection (Arc long)',
    'weapon_focus_shortbow': 'Arme de prédilection (Arc court)', 
    'weapon_focus_bow': 'Arme de prédilection (Arc)',
    'weapon_specialization_longbow': 'Spécialisation martiale (Arc long)',
    'weapon_specialization_shortbow': 'Spécialisation martiale (Arc court)',
    'point_blank_shot': 'Tir à bout portant',
    
    // General feats
    'alertness': 'Vigilance',
    'iron_will': 'Volonté de fer',
    'dodge': 'Esquive',
    'mobility': 'Souplesse du serpent',
    'spring_attack': 'Attaque éclair',
    'weapon_finesse': 'Attaque en finesse',
    'combat_expertise': 'Expertise du combat',
    'improved_disarm': 'Désarmement supérieur',
    'whirlwind_attack': 'Attaque tourbillonnante',
    'weapon_focus': 'Arme de prédilection',
    'weapon_specialization': 'Spécialisation martiale',
    
    // Spell feats
    'spell_focus_necromancy': 'École renforcée (Nécromancie)',
    'spell_penetration': 'Pénétration des sorts',
    'greater_spell_focus_necromancy': 'École supérieure (Nécromancie)',
    
    // Class-specific
    'wild_shape': 'Forme sauvage',
    'sneak_attack': 'Attaque sournoise',
    'turn_undead': 'Repousser les morts-vivants',
    
    // Movement feats
    'skill_focus_hide': 'Talent (Discrétion)',
    'skill_focus_move_silently': 'Talent (Déplacement silencieux)',
    
    // Skill feats pour Harper Scout
    'skill_focus_discipline': 'Talent (Discipline)',
    'skill_focus_lore': 'Talent (Connaissances)',
    'skill_focus_persuade': 'Talent (Persuasion)',
    'skill_focus_search': 'Talent (Fouille)'
  };
  
  return featNameMap[featId] || featId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Fonctions helper pour les nouveaux prérequis
function getAbilityScore(character: Character, ability: string): number {
  // Retourne la valeur de caractéristique du personnage
  // Pour l'instant, retournons une valeur par défaut de 10
  // Dans une implémentation complète, cela viendrait du modèle Character
  return 10;
}

function getAbilityName(ability: string): string {
  const abilityNames: Record<string, string> = {
    'strength': 'Force',
    'dexterity': 'Dextérité', 
    'constitution': 'Constitution',
    'intelligence': 'Intelligence',
    'wisdom': 'Sagesse',
    'charisma': 'Charisme'
  };
  return abilityNames[ability] || ability;
}

function checkKnowsPolymorphSpell(character: Character): boolean {
  // Vérifie si le personnage connaît le sort Métamorphose
  // Pour l'instant, retournons false par défaut
  // Dans une implémentation complète, cela vérifierait les sorts connus
  return false;
}

function checkSpellcastingRequirement(character: Character, requirement: string): boolean {
  // Vérifie si le personnage remplit les prérequis de lancement de sorts
  if (requirement === 'any_level_3') {
    // Vérifie si le personnage peut lancer des sorts de niveau 3
    return character.niveauTotal >= 5; // Approximation
  }
  return true;
}

function getSpellcastingRequirementText(requirement: string): string {
  const texts: Record<string, string> = {
    'any_level_3': 'Capacité à lancer des sorts de niveau 3',
    'arcane_level_1': 'Lanceur de sorts profanes niveau 1+',
    'divine_level_3': 'Lanceur de sorts divins niveau 3+'
  };
  return texts[requirement] || requirement;
}
