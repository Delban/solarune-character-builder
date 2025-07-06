// src/components/character-builder/CharacterCreator.tsx
import { useState } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { ALL_RACES } from '../../data/races';
import { allClasses } from '../../data';
import type { Attributes } from '../../models/Character';
import DebugAttributeManager from '../debug/DebugAttributeManager';

interface CharacterCreatorProps {
  onCharacterCreated?: () => void;
}

export function CharacterCreator({ onCharacterCreated }: CharacterCreatorProps = {}) {
  const { createCharacter, updateAttributes, addLevel } = useCharacter();
  const [characterName, setCharacterName] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attributes, setAttributes] = useState<Attributes>({
    force: 8,
    dexterite: 8,
    constitution: 8,
    intelligence: 8,
    sagesse: 8,
    charisme: 8
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Calcul des points dépensés (système 32 points)
  const calculatePointCost = (value: number): number => {
    if (value <= 8) return 0;
    if (value <= 14) return value - 8;
    if (value <= 16) return 6 + (value - 14) * 2;
    return 10 + (value - 16) * 3;
  };
  
  const totalPoints = Object.values(attributes).reduce((sum, value) => 
    sum + calculatePointCost(value), 0
  );
  const remainingPoints = 32 - totalPoints;
  
  const handleAttributeChange = (attr: keyof Attributes, value: number) => {
    const newAttributes = { ...attributes, [attr]: value };
    const newTotal = Object.values(newAttributes).reduce((sum, val) => 
      sum + calculatePointCost(val), 0
    );
    
    if (newTotal <= 32) {
      setAttributes(newAttributes);
    }
  };

  // Fonction pour appliquer un preset d'attributs depuis le debug
  const handleApplyPreset = (presetAttributes: Attributes) => {
    console.log('🐛 Applying preset:', presetAttributes);
    setAttributes(presetAttributes);
  };
  
  const handleCreateCharacter = async () => {
    if (characterName.trim() && selectedRace && selectedClass && remainingPoints === 0) {
      setIsCreating(true);
      try {
        // Créer le personnage de base
        createCharacter(characterName.trim(), selectedRace);
        
        // Appliquer les attributs après création
        setTimeout(() => {
          updateAttributes(attributes);
          
          // Ajouter le premier niveau avec la classe choisie
          setTimeout(() => {
            // Points de vie pour le niveau 1 (maximum pour la classe)
            const selectedClassData = allClasses.find(c => c.id === selectedClass);
            const hitDie = selectedClassData?.hit_die || 'd8';
            const maxHP = parseInt(hitDie.replace('d', '')) || 8;
            
            addLevel(selectedClass, maxHP);
            
            // Rediriger vers l'écran de progression
            if (onCharacterCreated) {
              setTimeout(() => {
                onCharacterCreated();
              }, 200);
            }
          }, 100);
        }, 100);
        
        // Réinitialiser le formulaire
        setCharacterName('');
        setSelectedRace('');
        setSelectedClass('');
        setAttributes({
          force: 8,
          dexterite: 8,
          constitution: 8,
          intelligence: 8,
          sagesse: 8,
          charisme: 8
        });
      } finally {
        setIsCreating(false);
      }
    }
  };
  
  const baseRaces = ALL_RACES.filter(race => !race.solaruneCustom);
  const solaruneRaces = ALL_RACES.filter(race => race.solaruneCustom);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un Nouveau Personnage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Commencez votre aventure en créant un personnage pour Neverwinter Nights
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-6">
        {/* Nom du personnage */}
        <div>
          <label htmlFor="character-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du Personnage
          </label>
          <input
            id="character-name"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Entrez le nom de votre personnage..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={50}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {characterName.length}/50 caractères
          </div>
        </div>
        
        {/* Sélection de race */}
        <div>
          <label htmlFor="character-race" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Race
          </label>
          <select
            id="character-race"
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choisissez une race...</option>
            
            {/* Races de base */}
            {baseRaces.length > 0 && (
              <optgroup label="Races Standard NWN">
                {baseRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.nom}
                  </option>
                ))}
              </optgroup>
            )}
            
            {/* Races Solarune */}
            {solaruneRaces.length > 0 && (
              <optgroup label="Races Custom Solarune">
                {solaruneRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.nom} ⭐
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        
        {/* Information sur la race sélectionnée */}
        {selectedRace && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {(() => {
              const race = ALL_RACES.find(r => r.id === selectedRace);
              if (!race) return null;
              
              return (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {race.nom}
                    {race.solaruneCustom && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                        Solarune
                      </span>
                    )}
                  </h3>
                  
                  {race.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {race.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Taille:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{race.taille}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vitesse:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{race.vitesse} ft</span>
                    </div>
                  </div>
                  
                  {/* Bonus d'attributs */}
                  {Object.keys(race.attributeBonuses).length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bonus d'attributs:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(race.attributeBonuses).map(([attr, bonus]) => (
                          <span
                            key={attr}
                            className={`text-xs px-2 py-1 rounded ${
                              bonus > 0
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {attr.charAt(0).toUpperCase() + attr.slice(1)} {bonus >= 0 ? '+' : ''}{bonus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Capacités spéciales */}
                  {race.modificateursSpeciaux && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Capacités spéciales:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {race.modificateursSpeciaux.visionNocturne && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            Vision nocturne
                          </span>
                        )}
                        {race.modificateursSpeciaux.visionInfra && (
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                            Vision infrarouge
                          </span>
                        )}
                        {race.modificateursSpeciaux.resistanceSort && (
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                            Résistance sort +{race.modificateursSpeciaux.resistanceSort}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Sélection de classe de départ */}
        <div>
          <label htmlFor="character-class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Classe de Départ
          </label>
          <select
            id="character-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choisissez votre première classe...</option>
            
            {/* Classes de base uniquement */}
            {allClasses
              .filter(classe => classe.type === 'base')
              .map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
          </select>
        </div>
        
        {/* Information sur la classe sélectionnée */}
        {selectedClass && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            {(() => {
              const classe = allClasses.find(c => c.id === selectedClass);
              if (!classe) return null;
              
              return (
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    {classe.nom}
                  </h3>
                  
                  {classe.description && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      {classe.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 dark:text-blue-400">Dé de vie:</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-200">{classe.hit_die}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-400">Points de comp.:</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-200">{classe.skill_points}</span>
                    </div>
                  </div>
                  
                  {/* Compétences de classe */}
                  {classe.skills && classe.skills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-blue-600 dark:text-blue-400">Compétences de classe:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classe.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                          >
                            {skill.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {classe.skills.length > 6 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            +{classe.skills.length - 6} autres...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Sélection des attributs de départ */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition des Attributs
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vous avez 32 points à répartir. Chaque attribut commence à 8.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(attributes).map(([attr, value]) => (
              <div key={attr} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {attr}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAttributeChange(attr as keyof Attributes, Math.max(8, value - 1))}
                    disabled={value <= 8}
                    className="w-8 h-8 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {value}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Coût: {calculatePointCost(value)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttributeChange(attr as keyof Attributes, Math.min(18, value + 1))}
                    disabled={value >= 18 || remainingPoints <= 0}
                    className="w-8 h-8 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Points utilisés: {totalPoints}/32
            </span>
            <span className={`text-sm font-medium ${
              remainingPoints === 0 
                ? 'text-green-600 dark:text-green-400' 
                : remainingPoints > 0 
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              Points restants: {remainingPoints}
            </span>
          </div>
          
          {remainingPoints !== 0 && (
            <div className={`p-3 rounded-lg text-sm ${
              remainingPoints > 0
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {remainingPoints > 0 
                ? `Il vous reste ${remainingPoints} point${remainingPoints > 1 ? 's' : ''} à répartir.`
                : `Vous avez dépassé de ${Math.abs(remainingPoints)} point${Math.abs(remainingPoints) > 1 ? 's' : ''}.`
              }
            </div>
          )}
        </div>

        {/* Bouton de création */}
        <button
          onClick={handleCreateCharacter}
          disabled={!characterName.trim() || !selectedRace || !selectedClass || remainingPoints !== 0 || isCreating}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isCreating ? 'Création...' : 'Créer le Personnage et Commencer'}
        </button>
        
        {/* Information sur le processus */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
            ✨ Nouveau Workflow Optimisé
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Une fois créé, vous serez automatiquement redirigé</li>
            <li>• Continuez avec vos niveaux suivants (max niveau 30)</li>
            <li>• Investissez vos points de compétences</li>
            <li>• Sélectionnez vos dons</li>
            <li>• Sauvegardez votre build complet</li>
          </ul>
        </div>
      </div>

      {/* Composant de debug pour les attributs - uniquement en développement */}
      <DebugAttributeManager onApplyPreset={handleApplyPreset} />
    </div>
  );
}
