// src/components/character-builder/UnifiedCharacterBuilder.tsx
import { useState } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useFeats } from '../../hooks/useFeats';
import { getFinalAttributes, calculateBaseAttackBonus } from '../../utils/characterCalculations';
import { allDons, allClasses } from '../../data';
import { AttributeEditor } from './AttributeEditor';
import { ClassSelector } from './ClassSelector';
import SkillManagement from './SkillManagement';
import type { Don } from '../../models/Don';

export function UnifiedCharacterBuilder() {
  const { state, addLevel, addFeatToLevel, removeFeatFromLevel, saveCharacter } = useCharacter();
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [featFilter, setFeatFilter] = useState('');
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [activeTab, setActiveTab] = useState<'progression' | 'attributes' | 'skills'>('progression');
  const [showOnlyAvailableFeats, setShowOnlyAvailableFeats] = useState(true);
  
  if (!state.currentCharacter) return null;
  
  const character = state.currentCharacter;
  const finalAttributes = getFinalAttributes(character);
  const baseAttackBonus = calculateBaseAttackBonus(character);
  const donsData = allDons as Don[];
  const classesData = allClasses as any[]; // Nouvelles classes NWN avec Shifter et Harper Scout
  
  const {
    featSlots,
    getAvailableFeatsForSlot,
    canSelectFeat,
    featStats
  } = useFeats(character, donsData);
  
  // Niveau maximum possible (30)
  const maxLevel = 30;
  const currentLevel = character.niveauTotal;
  
  // Fonction helper pour calculer les dons filtrés pour un slot
  const getFilteredFeatsForSlot = (slot: any) => {
    return getAvailableFeatsForSlot(slot).filter((don: Don) => {
      if (featFilter && !don.nom.toLowerCase().includes(featFilter.toLowerCase())) {
        return false;
      }
      
      // Restrictions de niveau pour certains dons spéciaux
      const currentLevel = character.niveauTotal;
      
      // Dons niveau 1 uniquement
      const level1OnlyFeats = [
        'artiste', 'borne', 'brute', 'discret', 'indomptable', 
        'chance_des_heros', 'magocratie_courtoise', 'paume_d_argent', 
        'sang_du_serpent', 'sanguin'
      ];
      if (level1OnlyFeats.includes(don.id) && currentLevel > 1) {
        return false;
      }
      
      // Dons épiques (niveau 21+)
      const epicFeats = [
        'vigueur_surhumaine', 'charisme_surhumain', 'constitution_surhumaine',
        'dexterite_surhumaine', 'force_surhumaine', 'reflexes_epiques',
        'sagesse_surhumaine', 'vigueur_epique', 'reputation_epique', 'volonte_epique'
      ];
      if (epicFeats.includes(don.id) && currentLevel < 21) {
        return false;
      }
      
      // Utiliser les restrictions niveau_min et niveau_max des données
      if (don.niveau_min && currentLevel < don.niveau_min) {
        return false;
      }
      if (don.niveau_max && currentLevel > don.niveau_max) {
        return false;
      }
      
      // Filtrer les dons de métamagie pour les classes non-lanceurs de sorts
      if (don.type.toLowerCase().includes('métamagie') || don.type.toLowerCase().includes('magicien')) {
        // Vérifier si le personnage a des niveaux dans des classes de lanceurs de sorts
        const hasSpellcasterLevels = character.niveaux.some(niveau => {
          const classId = niveau.classe;
          // Classes de lanceurs de sorts
          const spellcasterClasses = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'ranger', 'paladin'];
          return spellcasterClasses.includes(classId);
        });
        
        if (!hasSpellcasterLevels) {
          return false; // Filtrer ce don si pas de classe de lanceur de sorts
        }
      }
      
      if (showOnlyAvailableFeats) {
        const prerequisiteCheck = canSelectFeat(don);
        if (!prerequisiteCheck.canSelect) {
          return false;
        }
      }
      return true;
    });
  };
  
  // Calculer le nombre total de dons affichés pour le niveau actif
  const totalDisplayedFeats = featSlots
    .filter(slot => slot.level === activeLevel)
    .reduce((total, slot) => total + getFilteredFeatsForSlot(slot).length, 0);
    // Obtenir les dons sélectionnés pour un niveau spécifique
  const getFeatsForLevel = (level: number): string[] => {
    const levelData = character.niveaux.find(l => l.niveau === level);
    return levelData?.donsChoisis || [];
  };
  
  // Obtenir les dons automatiques pour un niveau spécifique
  const getAutomaticFeatsForLevel = (level: number): string[] => {
    const levelData = character.niveaux.find(l => l.niveau === level);
    return levelData?.donsAutomatiques || [];
  };
  
  // Vérifier si un niveau a un slot de don
  const hasGeneralFeatSlot = (level: number): boolean => {
    return featSlots.some(slot => slot.level === level && slot.type === 'general');
  };
  
  const hasBonusFeatSlot = (level: number): boolean => {
    return featSlots.some(slot => slot.level === level && slot.type === 'bonus');
  };
  
  const handleAddLevel = () => {
    if (currentLevel < maxLevel) {
      setShowClassSelector(true);
    }
  };
  
  const handleClassSelection = (classId: string) => {
    // Chercher d'abord dans les nouvelles classes NWN
    const nwnClass = classesData.find((c: any) => c.id === classId);
    let hitPoints = 8; // Valeur par défaut
    
    if (nwnClass) {
      // Calculer les PV basés sur le dé de vie de la classe NWN
      switch (nwnClass.hit_die) {
        case 'd4': hitPoints = 4; break;
        case 'd6': hitPoints = 6; break;
        case 'd8': hitPoints = 8; break;
        case 'd10': hitPoints = 10; break;
        case 'd12': hitPoints = 12; break;
        default: hitPoints = 8;
      }
    } else {
      // Fallback vers les anciennes données de classe
      const classData = classesData.find(c => c.id === classId);
      if (classData) {
        switch (classData.dés_de_vie) {
          case 'd4': hitPoints = 4; break;
          case 'd6': hitPoints = 6; break;
          case 'd8': hitPoints = 8; break;
          case 'd10': hitPoints = 10; break;
          case 'd12': hitPoints = 12; break;
          default: hitPoints = 8;
        }
      }
    }
    
    const newLevel = currentLevel + 1;
    addLevel(classId, hitPoints);
    
    // Mettre le focus sur le nouveau niveau ajouté
    setActiveLevel(newLevel);
    
    setShowClassSelector(false);
    setSelectedClass('');
  };
  
  const handleFeatSelection = (featId: string, slotIndex: number, level: number) => {
    const levelFeats = getFeatsForLevel(level);
    const currentFeatInSlot = levelFeats[slotIndex];
    
    if (currentFeatInSlot === featId) {
      // Désélectionner le don
      removeFeatFromLevel(level, featId);
    } else {
      // Si le slot a déjà un don, le retirer d'abord
      if (currentFeatInSlot) {
        removeFeatFromLevel(level, currentFeatInSlot);
      }
      // Ajouter le nouveau don
      addFeatToLevel(level, featId);
    }
  };
  
  // Obtenir un résumé des classes du personnage
  const getClassSummary = () => {
    const classCounts: { [key: string]: number } = {};
    character.niveaux.forEach(niveau => {
      classCounts[niveau.classe] = (classCounts[niveau.classe] || 0) + 1;
    });
    
    return Object.entries(classCounts)
      .map(([classId, count]) => {
        // Chercher dans les nouvelles classes NWN
        const nwnClass = classesData.find((c: any) => c.id === classId);
        const className = nwnClass?.nom || classId;
        return `${className} ${count}`;
      })
      .join(' / ');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec informations générales */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {character.nom}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Niveau {currentLevel} • {getClassSummary() || 'Aucune classe'} • BAB +{baseAttackBonus} • {featStats.usedSlots}/{featStats.totalSlots} dons
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('progression')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'progression'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Progression
                </button>
                <button
                  onClick={() => setActiveTab('attributes')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'attributes'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Attributs
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'skills'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Compétences
                </button>
              </div>
              
              <button
                onClick={handleAddLevel}
                disabled={currentLevel >= maxLevel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter Niveau
              </button>
              <button
                onClick={saveCharacter}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
          
          {/* Attributs finaux */}
          <div className="mt-4 grid grid-cols-6 gap-4">
            {Object.entries(finalAttributes).map(([attr, value]) => (
              <div key={attr} className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {attr}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Nouvelle interface de sélection de classe optimisée */}
      {showClassSelector && (
        <ClassSelector
          character={character}
          allClasses={classesData}
          allDons={donsData}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onCancel={() => {
            setShowClassSelector(false);
            setSelectedClass('');
          }}
          onConfirm={() => handleClassSelection(selectedClass)}
        />
      )}
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'attributes' ? (
          <AttributeEditor />
        ) : activeTab === 'skills' ? (
          <SkillManagement />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Colonne 1: Progression par niveau */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Progression par Niveau
                  </h2>
                </div>
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {Array.from({ length: Math.max(currentLevel, 1) }, (_, i) => i + 1).map(level => {
                  const isActive = level === activeLevel;
                  const hasGeneral = hasGeneralFeatSlot(level);
                  const hasBonus = hasBonusFeatSlot(level);
                  const levelFeats = getFeatsForLevel(level);
                  const automaticFeats = getAutomaticFeatsForLevel(level);
                  const totalFeats = levelFeats.length + automaticFeats.length;
                  const levelData = character.niveaux.find(l => l.niveau === level);
                  const nwnClass = levelData ? classesData.find((c: any) => c.id === levelData.classe) : null;
                  const className = nwnClass?.nom || (levelData?.classe || '');
                  
                  return (
                    <div
                      key={level}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setActiveLevel(level)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Niveau {level}
                          </span>
                          {className && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {className}
                            </div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {hasGeneral && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                Don Général
                              </span>
                            )}
                            {hasBonus && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded">
                                Don Bonus
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {totalFeats} don{totalFeats !== 1 ? 's' : ''}
                            {automaticFeats.length > 0 && (
                              <div className="text-xs text-purple-400">
                                +{automaticFeats.length} auto
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Dons pour ce niveau */}
                      {(levelFeats.length > 0 || automaticFeats.length > 0) && (
                        <div className="mt-2 space-y-1">
                          {/* Dons choisis */}
                          {levelFeats.map(featId => {
                            const feat = donsData.find(f => f.id === featId);
                            return (
                              <div key={`chosen-${featId}`} className="text-xs text-gray-600 dark:text-gray-400">
                                • {feat?.nom || featId}
                              </div>
                            );
                          })}
                          {/* Dons automatiques */}
                          {automaticFeats.map(featId => {
                            const feat = donsData.find(f => f.id === featId);
                            return (
                              <div key={`auto-${featId}`} className="text-xs text-purple-400 dark:text-purple-300">
                                ⚙ {feat?.nom || featId} <span className="opacity-60">(auto)</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Niveaux futurs (grises) */}
                {currentLevel < maxLevel && (
                  <div className="space-y-2 opacity-50">
                    {Array.from({ length: Math.min(5, maxLevel - currentLevel) }, (_, i) => currentLevel + i + 1).map(level => {
                      const hasGeneral = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30].includes(level);
                      
                      return (
                        <div key={level} className="p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">
                                Niveau {level}
                              </span>
                              {hasGeneral && (
                                <div className="mt-1">
                                  <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                    Don Général
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              À venir
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Colonne 2: Dons disponibles */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Dons pour Niveau {activeLevel}
                  </h2>
                  {(hasGeneralFeatSlot(activeLevel) || hasBonusFeatSlot(activeLevel)) ? (
                    <div className="flex gap-2">
                      {hasGeneralFeatSlot(activeLevel) && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Don Général Disponible
                        </span>
                      )}
                      {hasBonusFeatSlot(activeLevel) && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Don Bonus Disponible
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Pas de don disponible à ce niveau
                    </span>
                  )}
                </div>
                
                {/* Filtre des dons */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Rechercher un don..."
                    value={featFilter}
                    onChange={(e) => setFeatFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowOnlyAvailableFeats(!showOnlyAvailableFeats)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showOnlyAvailableFeats
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {showOnlyAvailableFeats ? '✓ Prérequis remplis uniquement' : '◯ Afficher tous les dons'}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {totalDisplayedFeats} don{totalDisplayedFeats !== 1 ? 's' : ''} affiché{totalDisplayedFeats !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {(hasGeneralFeatSlot(activeLevel) || hasBonusFeatSlot(activeLevel)) ? (
                  <div className="space-y-4">
                    {/* Affichage par slot de don */}
                    {featSlots.filter(slot => slot.level === activeLevel).map((slot, slotIndex) => {
                      const availableFeats = getFilteredFeatsForSlot(slot).filter((don: Don) => {
                        // Filtrer les dons déjà sélectionnés dans d'autres slots
                        const selectedFeats = getFeatsForLevel(activeLevel);
                        return !selectedFeats.includes(don.id) || selectedFeats[slotIndex] === don.id;
                      });
                      
                      const levelFeats = getFeatsForLevel(activeLevel);
                      const currentFeat = levelFeats[slotIndex] ? donsData.find(f => f.id === levelFeats[slotIndex]) : null;
                      
                      return (
                        <div
                          key={slot.id}
                          className={`border-2 rounded-lg p-4 ${
                            slot.type === 'general' 
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                              : 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                          }`}
                        >
                          {/* En-tête du slot */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {slot.description}
                              </h5>
                              {slot.restrictions && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                  Restriction: {slot.restrictions.join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {currentFeat ? '1/1' : '0/1'} utilisé
                            </div>
                          </div>

                          {/* Don actuellement sélectionné */}
                          {currentFeat && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Don sélectionné :
                              </h6>
                              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded border">
                                <span className="text-gray-900 dark:text-white font-medium">{currentFeat.nom}</span>
                                <button
                                  onClick={() => handleFeatSelection(currentFeat.id, slotIndex, activeLevel)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto"
                                  title="Supprimer ce don"
                                >
                                  ✕
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {currentFeat.fonctionnement}
                              </p>
                            </div>
                          )}

                          {/* Liste des dons disponibles pour ce slot */}
                          {!currentFeat && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Dons disponibles ({availableFeats.length}) :
                              </h6>
                              
                              {availableFeats.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  Aucun don disponible pour ce slot avec les filtres actuels.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {availableFeats.map((feat: Don) => {
                                    const prerequisiteCheck = canSelectFeat(feat);
                                    const canSelect = prerequisiteCheck.canSelect;

                                    return (
                                      <div
                                        key={feat.id}
                                        className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                                          canSelect
                                            ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-blue-300'
                                            : 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20 opacity-60 cursor-not-allowed'
                                        }`}
                                        onClick={() => canSelect && handleFeatSelection(feat.id, slotIndex, activeLevel)}
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
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Aucun don disponible à ce niveau.</p>
                    <p className="text-sm mt-2">
                      Les dons généraux sont disponibles aux niveaux : 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
