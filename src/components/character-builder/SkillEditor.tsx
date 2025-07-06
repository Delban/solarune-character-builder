// src/components/character-builder/SkillEditor.tsx
import { useState } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { BASE_SKILLS } from '../../models/Skills';
import { calculateSkillModifier, calculateAvailableSkillPoints } from '../../utils/characterCalculations';

export function SkillEditor() {
  const { state, updateSkills } = useCharacter();
  const [filter, setFilter] = useState('');
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  
  // Calculer les points de compétences disponibles (approximation)
  const availablePoints = character.niveaux.reduce((total, level) => {
    return total + calculateAvailableSkillPoints(character, level.niveau);
  }, 0);
  
  const usedPoints = Object.values(character.competences).reduce((total, points) => total + points, 0);
  
  const filteredSkills = BASE_SKILLS.filter(skill =>
    skill.nom.toLowerCase().includes(filter.toLowerCase()) ||
    skill.id.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleSkillChange = (skillId: string, value: number) => {
    const maxRanks = character.niveauTotal;
    const clampedValue = Math.max(0, Math.min(maxRanks, value));
    
    updateSkills({ [skillId]: clampedValue });
  };
  
  return (
    <div className="space-y-6">
      {/* En-tête avec informations sur les points */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Compétences
          </h3>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              usedPoints > availablePoints ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {usedPoints} / {availablePoints} points
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Points utilisés
            </div>
          </div>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Maximum {character.niveauTotal} rangs par compétence (niveau = rangs max).
        </p>
      </div>
      
      {/* Filtre de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une compétence..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Liste des compétences */}
      <div className="grid gap-3">
        {filteredSkills.map((skill) => {
          const ranks = character.competences[skill.id] || 0;
          const totalModifier = calculateSkillModifier(character, skill.id, skill);
          const attributeModifier = totalModifier - ranks;
          
          return (
            <div
              key={skill.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {skill.nom}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({skill.attributPrincipal.charAt(0).toUpperCase() + skill.attributPrincipal.slice(1)})
                  </span>
                  {skill.formation && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">
                      Formation
                    </span>
                  )}
                  {skill.armureAppliquee && (
                    <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                      Malus armure
                    </span>
                  )}
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {skill.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Modificateur total */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalModifier >= 0 ? '+' : ''}{totalModifier}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
                
                {/* Décomposition */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <div>{ranks} rangs</div>
                  <div>{attributeModifier >= 0 ? '+' : ''}{attributeModifier} mod</div>
                </div>
                
                {/* Contrôles de modification */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSkillChange(skill.id, ranks - 1)}
                    disabled={ranks <= 0}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={character.niveauTotal}
                    value={ranks}
                    onChange={(e) => handleSkillChange(skill.id, parseInt(e.target.value) || 0)}
                    className="w-16 text-center py-1 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleSkillChange(skill.id, ranks + 1)}
                    disabled={ranks >= character.niveauTotal}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Avertissement si trop de points utilisés */}
      {usedPoints > availablePoints && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
            Trop de points de compétences utilisés
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Vous avez utilisé {usedPoints - availablePoints} points de trop. 
            Réduisez vos rangs de compétences ou ajoutez des niveaux de classe.
          </p>
        </div>
      )}
      
      {/* Informations sur les compétences */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Informations sur les Compétences
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Formation:</strong> Certaines compétences nécessitent d'avoir au moins 1 rang pour être utilisées</li>
          <li>• <strong>Malus armure:</strong> Le malus d'armure s'applique à ces compétences</li>
          <li>• <strong>Maximum:</strong> Vous ne pouvez pas avoir plus de rangs dans une compétence que votre niveau total</li>
        </ul>
      </div>
    </div>
  );
}
