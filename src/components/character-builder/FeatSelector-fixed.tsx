// src/components/character-builder/FeatSelector.tsx
import { useState, useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useFeats } from '../../hooks/useFeats';
import { getFinalAttributes } from '../../utils/characterCalculations';
import listeDons from '../../data/listeDons.json';
import type { Don } from '../../models/Don';

export function FeatSelector() {
  const { state } = useCharacter();
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  const finalAttributes = getFinalAttributes(character);
  const donsData = listeDons as Don[];
  
  // Utiliser le hook personnalisé pour la gestion des dons
  const {
    featSlots,
    selectedFeats,
    getFeatsWithPrerequisites,
    featStats
  } = useFeats(character, donsData);
  
  // Filtrer les dons disponibles
  const availableFeats = useMemo(() => {
    return donsData.filter(don => {
      // Filtre par nom
      if (filter && !don.nom.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      
      // Filtre par catégorie
      if (selectedCategory !== 'all') {
        const hasCategory = don.type.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!hasCategory) return false;
      }
      
      return true;
    });
  }, [donsData, filter, selectedCategory]);
  
  // Catégories de dons
  const categories = useMemo(() => {
    const cats = new Set<string>();
    donsData.forEach(don => {
      don.type.split(',').forEach(type => cats.add(type.trim()));
    });
    return Array.from(cats).sort();
  }, [donsData]);
  
  const handleFeatSelect = (donId: string, level: number) => {
    // Cette fonction sera implémentée quand on aura le context update pour les dons
    console.log(`Sélection du don ${donId} pour le niveau ${level}`);
  };
  
  // Obtenir les dons avec leurs prérequis vérifiés
  const featsWithPrereqs = getFeatsWithPrerequisites(availableFeats);
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Gestion des Dons
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {featStats.usedSlots} / {featStats.totalSlots} dons
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {featStats.remainingSlots} emplacements restants
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div className="text-center">
            <div className="font-semibold">{featStats.generalSlots}</div>
            <div>Généraux</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{featStats.bonusSlots}</div>
            <div>Bonus</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{featStats.classSlots}</div>
            <div>Classe</div>
          </div>
        </div>
      </div>
      
      {/* Emplacements de dons */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Emplacements de Dons Disponibles
        </h4>
        <div className="grid gap-2">
          {featSlots.map((slot, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${
                slot.type === 'general' 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : slot.type === 'bonus'
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Niveau {slot.level}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    slot.type === 'general' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      : slot.type === 'bonus'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                  }`}>
                    {slot.type === 'general' ? 'Général' : slot.type === 'bonus' ? 'Bonus' : 'Classe'}
                  </span>
                </div>
                <button
                  onClick={() => console.log(`Sélectionner don pour niveau ${slot.level}`)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                >
                  Choisir Don
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {slot.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rechercher un don
          </label>
          <input
            type="text"
            placeholder="Nom du don..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Liste des dons disponibles */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Dons Disponibles ({featsWithPrereqs.length})
        </h4>
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {featsWithPrereqs.map(({ feat, prerequisiteCheck }) => {
            const isSelected = selectedFeats.includes(feat.id);
            const canSelect = prerequisiteCheck.canSelect && !isSelected;
            
            return (
              <div
                key={feat.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                    : canSelect
                    ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                    : 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {feat.nom}
                    </h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {feat.type.split(',').map((type, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          {type.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {feat.fonctionnement}
                    </p>
                    
                    {/* Prérequis */}
                    {feat.conditionsCaractéristiques && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Prérequis: 
                        </span>
                        {Object.entries(feat.conditionsCaractéristiques).map(([attr, required], idx) => {
                          const current = finalAttributes[attr as keyof typeof finalAttributes];
                          const meets = current >= required;
                          return (
                            <span
                              key={idx}
                              className={`ml-1 text-xs ${
                                meets 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {attr.charAt(0).toUpperCase() + attr.slice(1)} {required}
                              {meets ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Raisons d'indisponibilité */}
                    {!prerequisiteCheck.canSelect && prerequisiteCheck.reasons.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">
                          Problèmes:
                        </span>
                        <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside mt-1">
                          {prerequisiteCheck.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {isSelected ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ Sélectionné
                      </span>
                    ) : canSelect ? (
                      <button
                        onClick={() => handleFeatSelect(feat.id, 1)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        Sélectionner
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Non disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Informations sur les dons */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Informations sur les Dons
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Dons généraux:</strong> Obtenus aux niveaux 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30</li>
          <li>• <strong>Dons bonus:</strong> Certaines classes accordent des dons supplémentaires</li>
          <li>• <strong>Prérequis:</strong> Vérifiez vos attributs avant de sélectionner un don</li>
          <li>• <strong>Stacking:</strong> Certains dons peuvent être pris plusieurs fois</li>
        </ul>
      </div>
    </div>
  );
}
