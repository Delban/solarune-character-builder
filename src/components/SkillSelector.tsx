// src/components/SkillSelector.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useCharacter } from '../contexts/CharacterContext';
import type { SkillRanks } from '../models/Skills';
import { BASE_SKILLS } from '../models/Skills';
import { allClasses } from '../data';
import { calculateSkillPointsForLevel } from '../utils/skillCalculations';

interface SkillSelectorProps {
  /** Niveau pour lequel on assigne les compétences */
  level: number;
  /** Fonction appelée quand la validation est terminée */
  onComplete?: (skillRanks: SkillRanks, remainingPoints: number) => void;
  /** Mode lecture seule */
  readonly?: boolean;
  /** Titre personnalisé */
  title?: string;
}

const SkillSelector = React.memo(({ 
  level, 
  onComplete, 
  readonly = false,
  title 
}: SkillSelectorProps) => {
  const { darkMode } = useTheme();
  const { state } = useCharacter();
  const character = state.currentCharacter;
  
  // État local pour les rangs temporaires pendant l'édition
  const [tempSkillRanks, setTempSkillRanks] = useState<SkillRanks>(() => {
    if (!character) return {};
    
    // Initialiser avec les rangs existants du personnage (total cumulé)
    const existingRanks: SkillRanks = {};
    character.niveaux.forEach((niveau) => {
      if (niveau.competencesAmeliorees) {
        Object.entries(niveau.competencesAmeliorees).forEach(([skillId, ranks]) => {
          existingRanks[skillId] = (existingRanks[skillId] || 0) + (ranks as number);
        });
      }
    });
    
    return existingRanks;
  });

  // Calculs mémorisés
  const skillPointsInfo = useMemo(() => {
    if (!character) return null;
    try {
      return calculateSkillPointsForLevel(character, level);
    } catch (error) {
      console.error('Erreur calcul points compétences:', error);
      return null;
    }
  }, [character, level]);

  const classSkills = useMemo(() => {
    if (!character) return new Set<string>();
    const levelData = character.niveaux[level - 1];
    if (!levelData) return new Set<string>();
    
    // Obtenir les compétences de classe pour cette classe
    const classData = allClasses.find(c => c.id === levelData.classe);
    if (!classData || !classData.skills) return new Set<string>();
    
    return new Set(classData.skills);
  }, [character, level]);

  const skillCalculations = useMemo(() => {
    if (!character || !skillPointsInfo) return {};
    
    const calculations: { [skillId: string]: any } = {};
    
    BASE_SKILLS.forEach(skill => {
      try {
        const currentRanks = tempSkillRanks[skill.id] || 0;
        const isClassSkill = classSkills.has(skill.id);
        const costPerRank = isClassSkill ? 1 : 2;
        const maxRanks = isClassSkill ? level + 3 : Math.floor((level + 3) / 2);
        
        // Calculer le modificateur d'attribut
        const finalAttributes = character.attributsBase; // Simplifié pour l'instant
        const attributeValue = finalAttributes[skill.attributPrincipal];
        const attributeModifier = Math.floor((attributeValue - 10) / 2);
        
        calculations[skill.id] = {
          currentRanks,
          maxRanks,
          isClassSkill,
          costPerRank,
          totalCost: currentRanks * costPerRank,
          canIncrease: currentRanks < maxRanks,
          modifier: currentRanks + attributeModifier
        };
      } catch (error) {
        console.error(`Erreur calcul compétence ${skill.id}:`, error);
      }
    });
    
    return calculations;
  }, [character, level, tempSkillRanks, skillPointsInfo, classSkills]);

  // Points actuellement dépensés (calculé à partir des rangs temporaires)
  const spentPoints = useMemo(() => {
    if (!character) return 0;
    
    let total = 0;
    Object.entries(tempSkillRanks).forEach(([skillId, currentRanks]) => {
      const previousRanks = character.niveaux.slice(0, level - 1).reduce((sum, niveau) => {
        return sum + (niveau.competencesAmeliorees?.[skillId] || 0);
      }, 0);
      
      const newRanks = currentRanks - previousRanks;
      if (newRanks > 0) {
        const isClassSkill = classSkills.has(skillId);
        const costPerRank = isClassSkill ? 1 : 2;
        total += newRanks * costPerRank;
      }
    });
    
    return total;
  }, [tempSkillRanks, character, level, classSkills]);

  const remainingPoints = (skillPointsInfo?.totalPoints || 0) - spentPoints;

  // Gestionnaires d'événements
  const handleRankChange = useCallback((skillId: string, newTotalRanks: number) => {
    if (readonly) return;
    
    setTempSkillRanks(prev => ({
      ...prev,
      [skillId]: Math.max(0, newTotalRanks)
    }));
  }, [readonly]);

  const handleValidate = useCallback(() => {
    if (!character || !onComplete) return;
    
    // Calculer les nouveaux rangs pour ce niveau
    const newRanksThisLevel: SkillRanks = {};
    Object.entries(tempSkillRanks).forEach(([skillId, totalRanks]) => {
      const previousRanks = character.niveaux.slice(0, level - 1).reduce((sum, niveau) => {
        return sum + (niveau.competencesAmeliorees?.[skillId] || 0);
      }, 0);
      
      const newRanks = totalRanks - previousRanks;
      if (newRanks > 0) {
        newRanksThisLevel[skillId] = newRanks;
      }
    });
    
    // Validation simple
    if (remainingPoints < 0) {
      alert('Erreur: Vous avez dépassé le nombre de points disponibles !');
      return;
    }
    
    onComplete(newRanksThisLevel, remainingPoints);
  }, [character, tempSkillRanks, level, remainingPoints, onComplete]);

  const handleReset = useCallback(() => {
    if (readonly) return;
    
    // Remettre aux rangs existants (avant ce niveau)
    if (!character) return;
    
    const existingRanks: SkillRanks = {};
    character.niveaux.slice(0, level - 1).forEach((niveau) => {
      if (niveau.competencesAmeliorees) {
        Object.entries(niveau.competencesAmeliorees).forEach(([skillId, ranks]) => {
          existingRanks[skillId] = (existingRanks[skillId] || 0) + (ranks as number);
        });
      }
    });
    
    setTempSkillRanks(existingRanks);
  }, [character, level, readonly]);

  if (!character || !skillPointsInfo) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <p>Impossible de charger les informations de compétences</p>
      </div>
    );
  }

  const containerClasses = `p-6 rounded-lg shadow-lg ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;

  const headerClasses = `text-2xl font-bold mb-4 ${
    darkMode ? 'text-blue-300' : 'text-blue-600'
  }`;

  const pointsContainerClasses = `mb-6 p-4 rounded-lg border-l-4 ${
    remainingPoints < 0 
      ? darkMode ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-50 border-red-500 text-red-700'
      : remainingPoints === 0
      ? darkMode ? 'bg-green-900/20 border-green-500 text-green-300' : 'bg-green-50 border-green-500 text-green-700'
      : darkMode ? 'bg-blue-900/20 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-500 text-blue-700'
  }`;

  const skillRowClasses = (isClassSkill: boolean) => `
    grid grid-cols-12 gap-4 p-3 rounded-lg border transition-all
    ${darkMode 
      ? isClassSkill 
        ? 'bg-green-900/10 border-green-700/30 hover:bg-green-900/20' 
        : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
      : isClassSkill 
        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  `;

  const buttonClasses = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${
          darkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`;
      case 'secondary':
        return `${baseClasses} ${
          darkMode 
            ? 'bg-gray-600 hover:bg-gray-700 text-white' 
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`;
      case 'danger':
        return `${baseClasses} ${
          darkMode 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`;
    }
  };

  return (
    <div className={containerClasses}>
      {/* En-tête */}
      <h2 className={headerClasses}>
        {title || `Compétences - Niveau ${level}`}
      </h2>

      {/* Informations sur les points */}
      <div className={pointsContainerClasses}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Points disponibles:</span>
            <div className="text-lg font-bold">{skillPointsInfo.totalPoints}</div>
          </div>
          <div>
            <span className="font-semibold">Points dépensés:</span>
            <div className="text-lg font-bold">{spentPoints}</div>
          </div>
          <div>
            <span className="font-semibold">Points restants:</span>
            <div className={`text-lg font-bold ${remainingPoints < 0 ? 'text-red-500' : ''}`}>
              {remainingPoints}
            </div>
          </div>
          <div>
            <span className="font-semibold">Modificateur Int:</span>
            <div className="text-lg font-bold">+{skillPointsInfo.intModifier}</div>
          </div>
        </div>
        
        {skillPointsInfo.isFirstLevel && (
          <div className="mt-2 text-sm opacity-75">
            ✨ Points quadruplés au niveau 1
          </div>
        )}
        
        {remainingPoints < 0 && (
          <div className="mt-2 text-sm font-medium">
            ⚠️ Vous avez dépassé le nombre de points disponibles !
          </div>
        )}
      </div>

      {/* Liste des compétences */}
      <div className="space-y-2 mb-6">
        {/* En-tête du tableau */}
        <div className="grid grid-cols-12 gap-4 p-3 font-semibold text-sm border-b">
          <div className="col-span-4">Compétence</div>
          <div className="col-span-2 text-center">Attribut</div>
          <div className="col-span-2 text-center">Rangs</div>
          <div className="col-span-2 text-center">Max</div>
          <div className="col-span-2 text-center">Modificateur</div>
        </div>

        {BASE_SKILLS.map(skill => {
          const calculation = skillCalculations[skill.id];
          const isClassSkill = classSkills.has(skill.id);
          const currentRanks = tempSkillRanks[skill.id] || 0;
          
          if (!calculation) return null;

          return (
            <div key={skill.id} className={skillRowClasses(isClassSkill)}>
              {/* Nom de la compétence */}
              <div className="col-span-4 flex items-center">
                <div>
                  <div className="font-medium">{skill.nom}</div>
                  <div className="text-xs opacity-75 flex gap-2">
                    {isClassSkill && <span className="text-green-600">Classe</span>}
                    {skill.formation && <span className="text-orange-600">Formation</span>}
                    {skill.armureAppliquee && <span className="text-red-600">Armure</span>}
                    <span>Coût: {calculation.costPerRank}pt{calculation.costPerRank > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Attribut principal */}
              <div className="col-span-2 text-center flex items-center justify-center">
                <span className="text-sm font-medium capitalize">
                  {skill.attributPrincipal.slice(0, 3)}
                </span>
              </div>

              {/* Contrôles des rangs */}
              <div className="col-span-2 flex items-center justify-center gap-2">
                {!readonly && (
                  <button
                    onClick={() => handleRankChange(skill.id, currentRanks - 1)}
                    disabled={currentRanks <= 0}
                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                )}
                <span className="w-8 text-center font-bold">{currentRanks}</span>
                {!readonly && (
                  <button
                    onClick={() => handleRankChange(skill.id, currentRanks + 1)}
                    disabled={currentRanks >= calculation.maxRanks || remainingPoints < calculation.costPerRank}
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Maximum possible */}
              <div className="col-span-2 text-center flex items-center justify-center">
                <span className="text-sm">{calculation.maxRanks}</span>
              </div>

              {/* Modificateur total */}
              <div className="col-span-2 text-center flex items-center justify-center">
                <span className="font-bold text-lg">
                  {calculation.modifier >= 0 ? '+' : ''}{calculation.modifier}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!readonly && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleReset}
            className={buttonClasses('secondary')}
          >
            Réinitialiser
          </button>
          <button
            onClick={handleValidate}
            disabled={remainingPoints < 0}
            className={buttonClasses('primary')}
          >
            Valider {remainingPoints > 0 ? `(${remainingPoints} pts restants)` : ''}
          </button>
        </div>
      )}
    </div>
  );
});

SkillSelector.displayName = 'SkillSelector';

export default SkillSelector;
