// src/components/character-builder/ClassSelector.tsx
import { useState, useMemo } from 'react';
import { useClassRequirements } from '../../hooks/useClassRequirements';
import type { Character } from '../../models/Character';
import type { Don } from '../../models/Don';

interface ClassData {
  id: string;
  nom: string;
  description: string;
  type: 'base' | 'prestige';
  hit_die: string;
  skill_points: number;
  base_attack_bonus: 'full' | 'medium' | 'low';
  requirements?: any;
  alignment_restriction?: string;
}

interface ClassSelectorProps {
  character: Character;
  allClasses: ClassData[];
  allDons: Don[];
  selectedClass: string;
  onSelectClass: (classId: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClassSelector({
  character,
  allClasses,
  allDons,
  selectedClass,
  onSelectClass,
  onCancel,
  onConfirm
}: ClassSelectorProps) {
  const [activeTab, setActiveTab] = useState<'base' | 'prestige'>('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [modalData, setModalData] = useState<{ isOpen: boolean; classData: ClassData | null }>({ 
    isOpen: false, 
    classData: null 
  });

  const { getClassRequirements, getCompleteRequirements } = useClassRequirements(character, allClasses, allDons);

  // Fonction pour obtenir les classes valides par type
  const getValidClasses = (type: 'base' | 'prestige') => {
    return allClasses.filter(classe => {
      const isValidClass = classe.nom !== 'Base Class' && 
                          classe.nom !== 'Prestige Class' &&
                          classe.nom !== 'Monster Class' &&
                          classe.nom !== 'Favored Class' &&
                          classe.id !== 'base_class' &&
                          classe.id !== 'prestige_class' &&
                          classe.id !== 'monster_class' &&
                          classe.id !== 'favored_class' &&
                          classe.nom && 
                          classe.id &&
                          classe.nom.trim() !== '' &&
                          classe.id.trim() !== '';
      return isValidClass && classe.type === type;
    });
  };

  const filteredClasses = useMemo(() => {
    return allClasses.filter(classe => {
      // Filtrer les entrées invalides qui ne sont pas de vraies classes
      const isValidClass = classe.nom !== 'Base Class' && 
                          classe.nom !== 'Prestige Class' &&
                          classe.nom !== 'Monster Class' &&
                          classe.nom !== 'Favored Class' &&
                          classe.id !== 'base_class' &&
                          classe.id !== 'prestige_class' &&
                          classe.id !== 'monster_class' &&
                          classe.id !== 'favored_class' &&
                          classe.nom && 
                          classe.id &&
                          classe.nom.trim() !== '' &&
                          classe.id.trim() !== '';
      
      const matchesType = classe.type === activeTab;
      const matchesSearch = searchQuery === '' || 
        classe.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classe.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return isValidClass && matchesType && matchesSearch;
    });
  }, [allClasses, activeTab, searchQuery]);

  const availableClasses = useMemo(() => {
    return filteredClasses.filter(classe => {
      const requirements = getClassRequirements(classe.id);
      return requirements.canTake;
    });
  }, [filteredClasses, getClassRequirements]);

  const unavailableClasses = useMemo(() => {
    return filteredClasses.filter(classe => {
      const requirements = getClassRequirements(classe.id);
      return !requirements.canTake;
    });
  }, [filteredClasses, getClassRequirements]);

  const getBABDisplay = (bab: string) => {
    switch (bab) {
      case 'full': return { text: 'Complet', color: 'text-green-600' };
      case 'medium': return { text: 'Moyen', color: 'text-yellow-600' };
      case 'low': return { text: 'Faible', color: 'text-red-600' };
      default: return { text: bab, color: 'text-gray-600' };
    }
  };

  const ClassCard = ({ classe, available = true }: { classe: ClassData; available?: boolean }) => {
    const requirements = getClassRequirements(classe.id);
    const bab = getBABDisplay(classe.base_attack_bonus);
    const isSelected = selectedClass === classe.id;

    return (
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : available
            ? 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
            : 'border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20 opacity-60'
        } ${!available ? 'cursor-not-allowed' : ''}`}
        onClick={() => available && onSelectClass(classe.id)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold mb-1 ${available ? 'text-gray-900 dark:text-white' : 'text-red-700 dark:text-red-300'}`}>
            {classe.nom}
            {classe.type === 'prestige' && (
              <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                Prestige
              </span>
            )}
          </h3>
          {!available && (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Prérequis manquants
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {classe.description}
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">DV</div>
            <div className="font-medium">{classe.hit_die}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">BAB</div>
            <div className={`font-medium ${bab.color}`}>{bab.text}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">Comp.</div>
            <div className="font-medium">{classe.skill_points}</div>
          </div>
        </div>

        {!available && requirements.missingRequirements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
            <div className="text-xs text-red-600 dark:text-red-400">
              <div className="font-medium mb-1">Prérequis manquants :</div>
              <ul className="list-disc list-inside space-y-1">
                {requirements.missingRequirements.slice(0, 2).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
                {requirements.missingRequirements.length > 2 && (
                  <li>... et {requirements.missingRequirements.length - 2} autre(s)</li>
                )}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalData({ isOpen: true, classData: classe });
                }}
                className="mt-2 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Voir tous les prérequis
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const requirements = modalData.classData ? getCompleteRequirements(modalData.classData) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Sélectionner une classe - Niveau {character.niveauTotal + 1}
          </h2>

          {/* Onglets */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('base')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'base'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Classes de Base ({getValidClasses('base').length})
            </button>
            <button
              onClick={() => setActiveTab('prestige')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'prestige'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Classes de Prestige ({getValidClasses('prestige').length})
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher une classe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => setShowRequirements(!showRequirements)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                showRequirements
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {showRequirements ? 'Masquer' : 'Voir'} prérequis
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-auto p-6">
          {/* Classes disponibles */}
          {availableClasses.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Classes disponibles ({availableClasses.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableClasses.map((classe) => (
                  <ClassCard key={classe.id} classe={classe} available={true} />
                ))}
              </div>
            </div>
          )}

          {/* Classes non disponibles (classes de prestige seulement) */}
          {activeTab === 'prestige' && unavailableClasses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Prérequis non satisfaits ({unavailableClasses.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unavailableClasses.map((classe) => (
                  <ClassCard key={classe.id} classe={classe} available={false} />
                ))}
              </div>
            </div>
          )}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Aucune classe trouvée pour "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedClass || !getClassRequirements(selectedClass).canTake}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>

      {/* Modal des prérequis */}
      {modalData.isOpen && modalData.classData && requirements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Prérequis pour {modalData.classData.nom}
                </h3>
                <button
                  onClick={() => setModalData({ isOpen: false, classData: null })}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalData({ isOpen: false, classData: null })}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
