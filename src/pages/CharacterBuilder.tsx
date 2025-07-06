// src/pages/CharacterBuilder.tsx
import { useState } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { CharacterCreator } from '../components/character-builder/CharacterCreator';
import { UnifiedCharacterBuilder } from '../components/character-builder/UnifiedCharacterBuilder';

export function CharacterBuilder() {
  const { state, validateCharacter, resetCharacter } = useCharacter();
  const [showCreateForm, setShowCreateForm] = useState(!state.currentCharacter);
  
  const handleNewCharacter = () => {
    if (state.isModified) {
      const confirmReset = confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous vraiment créer un nouveau personnage ?'
      );
      if (!confirmReset) return;
    }
    resetCharacter();
    setShowCreateForm(true);
  };
  
  const handleCharacterCreated = () => {
    setShowCreateForm(false);
  };
  
  const handleValidateCharacter = () => {
    validateCharacter();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showCreateForm || !state.currentCharacter ? (
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Character Builder Solarune
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Créez votre personnage pour Neverwinter Nights - Serveur Solarune
              </p>
            </div>
            
            <CharacterCreator onCharacterCreated={handleCharacterCreated} />
            
            {state.currentCharacter && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleCharacterCreated}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Continuer avec ce personnage
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <UnifiedCharacterBuilder />
      )}
      
      {/* Actions globales */}
      {state.currentCharacter && !showCreateForm && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <button
            onClick={handleNewCharacter}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 text-sm"
          >
            Nouveau Personnage
          </button>
          <button
            onClick={handleValidateCharacter}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-700 text-sm"
          >
            Valider Build
          </button>
        </div>
      )}
      
      {/* Affichage des erreurs de validation */}
      {state.validation && !state.validation.valid && (
        <div className="fixed top-4 right-4 max-w-md bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Erreurs de validation
          </h3>
          <ul className="text-sm text-red-700 dark:text-red-200 space-y-1">
            {state.validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          {state.validation.warnings.length > 0 && (
            <>
              <h4 className="text-md font-semibold text-red-900 dark:text-red-100 mt-3 mb-1">
                Avertissements
              </h4>
              <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                {state.validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
