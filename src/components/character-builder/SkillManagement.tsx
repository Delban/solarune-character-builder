// src/components/character-builder/SkillManagement.tsx
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCharacter } from '../../contexts/CharacterContext';
import SkillLevelUp from './SkillLevelUp';
import type { SkillRanks } from '../../models/Skills';
import { calculateSkillPointsForLevel } from '../../utils/skillCalculations';

export function SkillManagement() {
  const { darkMode } = useTheme();
  const { state, updateLevelSkills } = useCharacter();
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  
  const character = state.currentCharacter;
  
  if (!character) return null;
  
  // Calculer les niveaux qui ont besoin de répartition de compétences
  const getLevelsNeedingSkills = () => {
    const levels: number[] = [];
    
    for (let level = 1; level <= character.niveauTotal; level++) {
      try {
        const skillPointsInfo = calculateSkillPointsForLevel(character, level);
        const levelData = character.niveaux[level - 1];
        
        // Si le niveau n'a pas de compétences réparties ou a des points non dépensés
        const hasUnspentPoints = (levelData?.pointsCompetencesNonDepenses || 0) > 0;
        const hasNoSkills = !levelData?.competencesAmeliorees || Object.keys(levelData.competencesAmeliorees).length === 0;
        
        if (hasUnspentPoints || (hasNoSkills && skillPointsInfo.totalPoints > 0)) {
          levels.push(level);
        }
      } catch (error) {
        console.error(`Erreur calcul niveau ${level}:`, error);
      }
    }
    
    return levels;
  };
  
  const levelsNeedingSkills = getLevelsNeedingSkills();
  
  const handleSkillComplete = (skillRanks: SkillRanks, remainingPoints: number) => {
    updateLevelSkills(selectedLevel, skillRanks, remainingPoints);
    setShowSkillModal(false);
  };
  
  const handleSkillCancel = () => {
    setShowSkillModal(false);
  };
  
  const openSkillModal = (level: number) => {
    setSelectedLevel(level);
    setShowSkillModal(true);
  };
  
  const containerClasses = `p-6 rounded-lg shadow-lg ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;
  
  const headerClasses = `text-2xl font-bold mb-4 ${
    darkMode ? 'text-blue-300' : 'text-blue-600'
  }`;
  
  const levelButtonClasses = (needsSkills: boolean) => `
    px-4 py-2 rounded-lg font-medium transition-colors ${
      needsSkills
        ? darkMode
          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        : darkMode
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white'
    }
  `;
  
  return (
    <>
      <div className={containerClasses}>
        <h2 className={headerClasses}>
          Gestion des Compétences
        </h2>
        
        {levelsNeedingSkills.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            darkMode ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300' : 'bg-yellow-50 border-yellow-500 text-yellow-700'
          }`}>
            <div className="font-semibold mb-2">
              ⚠️ {levelsNeedingSkills.length} niveau(x) ont des points de compétences non répartis
            </div>
            <p className="text-sm">
              Vous devez répartir vos points de compétences pour finaliser votre personnage.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Niveaux du personnage
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: character.niveauTotal }, (_, index) => {
              const level = index + 1;
              const needsSkills = levelsNeedingSkills.includes(level);
              const levelData = character.niveaux[level - 1];
              
              let skillPointsInfo;
              try {
                skillPointsInfo = calculateSkillPointsForLevel(character, level);
              } catch (error) {
                console.error(`Erreur niveau ${level}:`, error);
              }
              
              return (
                <div key={level} className="text-center">
                  <button
                    onClick={() => openSkillModal(level)}
                    className={levelButtonClasses(needsSkills)}
                  >
                    Niveau {level}
                  </button>
                  
                  <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>Classe: {levelData?.classe || 'N/A'}</div>
                    {skillPointsInfo && (
                      <div>
                        Points: {skillPointsInfo.totalPoints}
                        {(levelData?.pointsCompetencesNonDepenses || 0) > 0 && (
                          <span className="text-yellow-500"> ({levelData?.pointsCompetencesNonDepenses} restants)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {character.niveauTotal === 0 && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Aucun niveau ajouté. Créez d'abord votre personnage.
            </div>
          )}
        </div>
        
        {/* Résumé des compétences */}
        <div className="mt-8">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Résumé des compétences
          </h3>
          
          {character.competences && Object.keys(character.competences).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(character.competences)
                .filter(([_, ranks]) => ranks > 0)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([skillId, ranks]) => (
                  <div key={skillId} className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="font-medium">{skillId}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {ranks} rang{ranks > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Aucune compétence acquise
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de sélection de compétences */}
      {showSkillModal && (
        <SkillLevelUp
          level={selectedLevel}
          onComplete={handleSkillComplete}
          onCancel={handleSkillCancel}
        />
      )}
    </>
  );
}

export default SkillManagement;
