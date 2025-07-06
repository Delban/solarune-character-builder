// src/components/character-builder/FeatSelector.tsx
import { useState, useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useFeats } from '../../hooks/useFeats';
import { getFinalAttributes } from '../../utils/characterCalculations';
import listeDons from '../../data/listeDons.json';
import type { Don } from '../../models/Don';

export function FeatSelector() {
  const { state, addFeatToLevel, removeFeatFromLevel } = useCharacter();
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
    getAvailableFeatsForSlot,
    canSelectFeat,
    featStats
  } = useFeats(character, donsData);
  
  // Calculer les dons utilisés par slot (simple mapping basé sur le niveau)
  const usedFeatsBySlot = useMemo(() => {
    const result: { [slotId: string]: string[] } = {};
    
    featSlots.forEach(slot => {
      const levelData = character.niveaux[slot.level - 1];
      if (levelData) {
        // Simplification: tous les dons d'un niveau sont attribués à tous les slots de ce niveau
        // Cela pourrait être amélioré pour une attribution plus précise
        result[slot.id] = levelData.donsChoisis.slice();
      } else {
        result[slot.id] = [];
      }
    });
    
    return result;
  }, [featSlots, character.niveaux]);
  
  // Capacité de chaque slot (pour l'instant 1 don par slot)
  const getSlotCapacity = () => 1;
  
  // Vérifier si un slot est plein
  const isSlotFull = (slot: any) => {
    const used = usedFeatsBySlot[slot.id] || [];
    return used.length >= getSlotCapacity();
  };
  
  // Catégories de dons
  const categories = useMemo(() => {
    const cats = new Set<string>();
    donsData.forEach(don => {
      don.type.split(',').forEach((type: string) => cats.add(type.trim()));
    });
    return Array.from(cats).sort();
  }, [donsData]);

  const handleFeatSelect = (donId: string, slotId: string) => {
    const slot = featSlots.find(s => s.id === slotId);
    if (!slot) return;
    
    // Vérifier si le slot est déjà plein
    if (isSlotFull(slot)) {
      console.warn(`Slot ${slotId} est déjà plein`);
      return;
    }
    
    // Vérifier si le don peut être sélectionné
    const feat = donsData.find(f => f.id === donId);
    if (feat && canSelectFeat(feat).canSelect) {
      addFeatToLevel(slot.level, donId);
      console.log(`Don ${donId} ajouté au slot ${slotId} (niveau ${slot.level})`);
    } else {
      console.warn(`Impossible d'ajouter le don ${donId} - prérequis non satisfaits`);
    }
  };

  const handleFeatRemove = (donId: string, slotId: string) => {
    const slot = featSlots.find(s => s.id === slotId);
    if (!slot) return;
    
    removeFeatFromLevel(slot.level, donId);
    console.log(`Don ${donId} supprimé du slot ${slotId}`);
  };
  
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

      {/* Filtres globaux */}
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

      {/* Slots de dons organisés par niveau et type */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Emplacements de Dons par Niveau
        </h4>
        
        {featSlots.map((slot) => {
          const usedFeats = usedFeatsBySlot[slot.id] || [];
          const isFull = isSlotFull(slot);
          const capacity = getSlotCapacity();
          const availableFeats = getAvailableFeatsForSlot(slot).filter(don => {
            // Filtres globaux
            if (filter && !don.nom.toLowerCase().includes(filter.toLowerCase())) {
              return false;
            }
            if (selectedCategory !== 'all') {
              const hasCategory = don.type.toLowerCase().includes(selectedCategory.toLowerCase());
              if (!hasCategory) return false;
            }
            // Filtrer les dons déjà sélectionnés
            return !selectedFeats.includes(don.id);
          });

          return (
            <div
              key={slot.id}
              className={`border-2 rounded-lg p-4 ${
                slot.type === 'general' 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : slot.type === 'bonus'
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
              }`}
            >
              {/* En-tête du slot */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Niveau {slot.level}
                  </h5>
                  <span className={`text-xs px-2 py-1 rounded ${
                    slot.type === 'general' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      : slot.type === 'bonus'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                  }`}>
                    {slot.type === 'general' ? 'Don Général' : slot.type === 'bonus' ? 'Don Bonus' : 'Don de Classe'}
                    {slot.source && ` (${slot.source})`}
                  </span>
                  {slot.restrictions && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                      Restriction: {slot.restrictions.join(', ')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {usedFeats.length} / {capacity} utilisés
                </div>
              </div>

              {/* Dons actuellement sélectionnés pour ce slot */}
              {usedFeats.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dons sélectionnés :
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {usedFeats.map(featId => {
                      const feat = donsData.find(f => f.id === featId);
                      return feat ? (
                        <div 
                          key={featId}
                          className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm border"
                        >
                          <span className="text-gray-900 dark:text-white">{feat.nom}</span>
                          <button
                            onClick={() => handleFeatRemove(featId, slot.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Supprimer ce don"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Liste des dons disponibles pour ce slot */}
              {!isFull && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Dons disponibles ({availableFeats.length}) :
                  </h6>
                  
                  {availableFeats.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Aucun don disponible pour ce slot avec les filtres actuels.
                    </p>
                  ) : (
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {availableFeats.slice(0, 10).map(feat => {
                        const prerequisiteCheck = canSelectFeat(feat);
                        const canSelect = prerequisiteCheck.canSelect;

                        return (
                          <div
                            key={feat.id}
                            className={`flex items-center justify-between p-3 rounded border ${
                              canSelect
                                ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-blue-300'
                                : 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20 opacity-60'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {feat.nom}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {feat.type}
                              </div>
                              {!canSelect && (
                                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  {prerequisiteCheck.reasons.join(', ')}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleFeatSelect(feat.id, slot.id)}
                              disabled={!canSelect}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                canSelect
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Sélectionner
                            </button>
                          </div>
                        );
                      })}
                      
                      {availableFeats.length > 10 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                          ... et {availableFeats.length - 10} autres dons (utilisez les filtres pour affiner)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isFull && (
                <div className="text-center py-4">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Slot complet ({capacity}/{capacity} dons sélectionnés)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informations sur les dons */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Informations sur les Dons
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Dons généraux:</strong> Obtenus aux niveaux 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30</li>
          <li>• <strong>Dons bonus:</strong> Certaines classes accordent des dons supplémentaires avec restrictions</li>
          <li>• <strong>Prérequis:</strong> Vérifiez vos attributs avant de sélectionner un don</li>
          <li>• <strong>Capacité:</strong> Chaque slot peut contenir un nombre limité de dons</li>
        </ul>
      </div>
    </div>
  );
}
