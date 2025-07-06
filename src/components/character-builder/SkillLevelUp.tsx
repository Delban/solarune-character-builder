// src/components/character-builder/SkillLevelUp.tsx
import { useTheme } from '../../contexts/ThemeContext';
import { useCharacter } from '../../contexts/CharacterContext';
import SkillSelector from '../SkillSelector';
import type { SkillRanks } from '../../models/Skills';

interface SkillLevelUpProps {
  level: number;
  onComplete: (skillRanks: SkillRanks, remainingPoints: number) => void;
  onCancel: () => void;
}

export function SkillLevelUp({ level, onComplete, onCancel }: SkillLevelUpProps) {
  const { darkMode } = useTheme();
  const { state } = useCharacter();
  const character = state.currentCharacter;

  if (!character) {
    return null;
  }

  const modalClasses = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`;
  const contentClasses = `max-w-6xl w-full max-h-[90vh] overflow-hidden ${
    darkMode ? 'bg-gray-800' : 'bg-white'
  } rounded-lg shadow-xl`;

  return (
    <div className={modalClasses}>
      <div className={contentClasses}>
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Répartition des compétences - Niveau {level}
              </h2>
              <button
                onClick={onCancel}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Répartissez vos points de compétences pour ce niveau. 
              Les compétences de classe coûtent 1 point par rang, 
              les compétences hors-classe coûtent 2 points par rang.
            </p>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-auto p-6">
            <SkillSelector
              level={level}
              onComplete={onComplete}
              title={`Compétences - Niveau ${level}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillLevelUp;
