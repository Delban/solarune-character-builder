// src/components/character-builder/CharacterSheet.tsx
import { useState } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { ALL_RACES } from '../../data/races';
import { getFinalAttributes, getAttributeModifier } from '../../utils/characterCalculations';
import { AttributeEditor } from './AttributeEditor';
import { SkillEditor } from './SkillEditor';
import { LevelProgression } from './LevelProgression';
import { FeatSelector } from './FeatSelector';

export function CharacterSheet() {
  const { state } = useCharacter();
  const [activeTab, setActiveTab] = useState<'attributes' | 'skills' | 'feats' | 'levels' | 'summary'>('attributes');
  
  if (!state.currentCharacter) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p>Aucun personnage sélectionné. Créez un nouveau personnage pour commencer.</p>
      </div>
    );
  }
  
  const character = state.currentCharacter;
  const race = ALL_RACES.find(r => r.id === character.race);
  const finalAttributes = getFinalAttributes(character);
  
  const tabs = [
    { id: 'attributes', label: 'Attributs', icon: '💪' },
    { id: 'skills', label: 'Compétences', icon: '🎯' },
    { id: 'feats', label: 'Dons', icon: '⭐' },
    { id: 'levels', label: 'Niveaux', icon: '📈' },
    { id: 'summary', label: 'Résumé', icon: '📋' }
  ] as const;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* En-tête du personnage */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {character.nom}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {race?.nom} • Niveau {character.niveauTotal}
            </p>
          </div>
          
          {/* Validation Status */}
          {state.validation && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              state.validation.valid 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {state.validation.valid ? '✓ Valide' : '⚠ Erreurs'}
            </div>
          )}
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {character.pointsVieTotal}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Points de Vie</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              +{character.bonusAttaqueBase}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">BBA</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {finalAttributes.force} ({getAttributeModifier(finalAttributes.force) >= 0 ? '+' : ''}{getAttributeModifier(finalAttributes.force)})
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Force</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {finalAttributes.dexterite} ({getAttributeModifier(finalAttributes.dexterite) >= 0 ? '+' : ''}{getAttributeModifier(finalAttributes.dexterite)})
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dextérité</div>
          </div>
        </div>
      </div>
      
      {/* Onglets de navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'attributes' && <AttributeEditor />}
        {activeTab === 'skills' && <SkillEditor />}
        {activeTab === 'feats' && <FeatSelector />}
        {activeTab === 'levels' && <LevelProgression />}
        {activeTab === 'summary' && <CharacterSummary />}
      </div>
      
      {/* Messages de validation */}
      {state.validation && !state.validation.valid && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Erreurs de validation:
          </h3>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
            {state.validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Avertissements */}
      {state.validation?.warnings.length && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Avertissements:
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
            {state.validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Composant de résumé du personnage
function CharacterSummary() {
  const { state } = useCharacter();
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  const finalAttributes = getFinalAttributes(character);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Résumé du Personnage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attributs finaux */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Attributs Finaux</h4>
            <div className="space-y-2">
              {Object.entries(finalAttributes).map(([attr, value]) => (
                <div key={attr} className="flex justify-between">
                  <span className="capitalize text-gray-600 dark:text-gray-400">{attr}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value} ({getAttributeModifier(value) >= 0 ? '+' : ''}{getAttributeModifier(value)})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Progression des classes */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Classes</h4>
            <div className="space-y-2">
              {character.niveaux.length > 0 ? (
                character.niveaux.map((level, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Niveau {level.niveau}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {level.classe}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun niveau de classe ajouté
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
