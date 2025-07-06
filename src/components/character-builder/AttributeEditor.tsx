// src/components/character-builder/AttributeEditor.tsx
import { useCharacter } from '../../contexts/CharacterContext';
import { ALL_RACES } from '../../data/races';
import { 
  validateAttributeAllocation, 
  calculatePointBuyCost, 
  getFinalAttributes,
  getAttributeModifier 
} from '../../utils/characterCalculations';

export function AttributeEditor() {
  const { state, updateAttributes } = useCharacter();
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  const race = ALL_RACES.find(r => r.id === character.race);
  const finalAttributes = getFinalAttributes(character);
  const pointCost = calculatePointBuyCost(character.attributsBase);
  const validation = validateAttributeAllocation(character.attributsBase);
  
  const handleAttributeChange = (attribute: keyof typeof character.attributsBase, value: number) => {
    updateAttributes({ [attribute]: Math.max(8, Math.min(18, value)) });
  };
  
  const attributes = [
    { key: 'force', label: 'Force', description: 'Détermine les dégâts au corps à corps et la capacité de charge' },
    { key: 'dexterite', label: 'Dextérité', description: 'Influence la CA, les jets de réflexes et les compétences basées sur l\'agilité' },
    { key: 'constitution', label: 'Constitution', description: 'Détermine les points de vie et la résistance aux maladies' },
    { key: 'intelligence', label: 'Intelligence', description: 'Influence les points de compétences et certains sorts' },
    { key: 'sagesse', label: 'Sagesse', description: 'Affecte les jets de volonté et les compétences de perception' },
    { key: 'charisme', label: 'Charisme', description: 'Influence les interactions sociales et certains sorts' }
  ] as const;
  
  return (
    <div className="space-y-6">
      {/* Informations sur le système de points */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Répartition des Attributs (Point Buy)
          </h3>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              pointCost > 32 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {pointCost} / 32 points
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Points utilisés
            </div>
          </div>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Répartissez 32 points entre vos attributs (min: 8, max: 18 avant bonus raciaux).
        </p>
      </div>
      
      {/* Bonus raciaux */}
      {race?.attributeBonuses && Object.keys(race.attributeBonuses).length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
            Bonus Raciaux ({race.nom})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(race.attributeBonuses).map(([attr, bonus]) => (
              <div key={attr} className="text-green-700 dark:text-green-300">
                {attr.charAt(0).toUpperCase() + attr.slice(1)}: {bonus >= 0 ? '+' : ''}{bonus}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Éditeur d'attributs */}
      <div className="grid gap-4">
        {attributes.map(({ key, label, description }) => {
          const baseValue = character.attributsBase[key];
          const racialBonus = race?.attributeBonuses?.[key] || 0;
          const finalValue = finalAttributes[key];
          const modifier = getAttributeModifier(finalValue);
          
          return (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {finalValue}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ({modifier >= 0 ? '+' : ''}{modifier})
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Base:</label>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAttributeChange(key, baseValue - 1)}
                      disabled={baseValue <= 8}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={8}
                      max={18}
                      value={baseValue}
                      onChange={(e) => handleAttributeChange(key, parseInt(e.target.value) || 8)}
                      className="w-16 text-center py-1 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleAttributeChange(key, baseValue + 1)}
                      disabled={baseValue >= 18}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {racialBonus !== 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Racial: {racialBonus >= 0 ? '+' : ''}{racialBonus}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Messages de validation */}
      {!validation.valid && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
            Erreurs de répartition:
          </h4>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
            Avertissements:
          </h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
