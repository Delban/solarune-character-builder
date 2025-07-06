// src/components/character-builder/LevelProgression.tsx
import { useState } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';

export function LevelProgression() {
  const { state, addLevel } = useCharacter();
  const [selectedClass, setSelectedClass] = useState('');
  const [hitPointsRoll, setHitPointsRoll] = useState(1);
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  const canAddLevel = character.niveauTotal < 30;
  
  // Classes de base NWN (simplifié pour l'exemple)
  const availableClasses = [
    { id: 'barbare', nom: 'Barbare', hitDie: 12 },
    { id: 'barde', nom: 'Barde', hitDie: 6 },
    { id: 'clerc', nom: 'Clerc', hitDie: 8 },
    { id: 'druide', nom: 'Druide', hitDie: 8 },
    { id: 'ensorceleur', nom: 'Ensorceleur', hitDie: 4 },
    { id: 'guerrier', nom: 'Guerrier', hitDie: 10 },
    { id: 'magicien', nom: 'Magicien', hitDie: 4 },
    { id: 'moine', nom: 'Moine', hitDie: 8 },
    { id: 'paladin', nom: 'Paladin', hitDie: 10 },
    { id: 'rodeur', nom: 'Rôdeur', hitDie: 10 },
    { id: 'roublard', nom: 'Roublard', hitDie: 6 }
  ];
  
  const handleAddLevel = () => {
    if (selectedClass && hitPointsRoll > 0) {
      addLevel(selectedClass, hitPointsRoll);
      setHitPointsRoll(1);
    }
  };
  
  const selectedClassData = availableClasses.find(c => c.id === selectedClass);
  
  return (
    <div className="space-y-6">
      {/* Progression actuelle */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progression Actuelle
        </h3>
        
        {character.niveaux.length > 0 ? (
          <div className="space-y-2">
            {character.niveaux.map((level, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Niveau {level.niveau}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 capitalize">
                    {level.classe}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>+{level.pointsVieGagnes} PV</div>
                  {level.attributAugmente && (
                    <div className="text-green-600 dark:text-green-400">
                      +1 {level.attributAugmente}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            Aucun niveau de classe ajouté. Commencez par ajouter votre premier niveau !
          </div>
        )}
      </div>
      
      {/* Ajouter un nouveau niveau */}
      {canAddLevel && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ajouter le Niveau {character.niveauTotal + 1}
          </h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
            {/* Sélection de classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner une classe...</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nom} (d{cls.hitDie})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Points de vie gagnés */}
            {selectedClassData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points de Vie Gagnés (1-{selectedClassData.hitDie})
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min={1}
                    max={selectedClassData.hitDie}
                    value={hitPointsRoll}
                    onChange={(e) => setHitPointsRoll(parseInt(e.target.value) || 1)}
                    className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setHitPointsRoll(1)}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Min (1)
                    </button>
                    <button
                      onClick={() => setHitPointsRoll(Math.ceil(selectedClassData.hitDie / 2))}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Moyen ({Math.ceil(selectedClassData.hitDie / 2)})
                    </button>
                    <button
                      onClick={() => setHitPointsRoll(selectedClassData.hitDie)}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Max ({selectedClassData.hitDie})
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Le modificateur de Constitution sera ajouté automatiquement
                </p>
              </div>
            )}
            
            {/* Bonus d'attribut (tous les 4 niveaux) */}
            {(character.niveauTotal + 1) % 4 === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  🎉 Bonus d'Attribut !
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Au niveau {character.niveauTotal + 1}, vous gagnez +1 point d'attribut à répartir.
                  Vous pourrez le choisir après avoir ajouté le niveau.
                </p>
              </div>
            )}
            
            {/* Bouton d'ajout */}
            <button
              onClick={handleAddLevel}
              disabled={!selectedClass || hitPointsRoll < 1}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Ajouter le Niveau {character.niveauTotal + 1}
            </button>
          </div>
        </div>
      )}
      
      {/* Information sur les limites */}
      {character.niveauTotal >= 30 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Niveau Maximum Atteint
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Votre personnage a atteint le niveau maximum de 30. 
            Aucun niveau supplémentaire ne peut être ajouté.
          </p>
        </div>
      )}
      
      {/* Résumé des classes */}
      {character.niveaux.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Résumé des Classes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              character.niveaux.reduce((acc, level) => {
                acc[level.classe] = (acc[level.classe] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([className, levels]) => (
              <div
                key={className}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {className}
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {levels}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  niveau{levels > 1 ? 'x' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
