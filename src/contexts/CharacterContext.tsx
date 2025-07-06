// src/contexts/CharacterContext.tsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Character, ValidationResult } from '../models/Character';
import type { ClassNWN } from '../models/ClassNWN';
import { validateCharacterProgression, createBaseCharacter } from '../utils/characterCalculations';
import { addMissingAutomaticFeats } from '../utils/automaticFeats';
import { applyRacialFeats } from '../utils/racialFeats';
import { allClasses } from '../data';

// Types pour les actions
type CharacterAction =
  | { type: 'CREATE_CHARACTER'; payload: { name: string; raceId: string } }
  | { type: 'LOAD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_ATTRIBUTES'; payload: Partial<Character['attributsBase']> }
  | { type: 'UPDATE_RACE'; payload: { raceId: string } }
  | { type: 'ADD_LEVEL'; payload: { classe: string; pointsVieGagnes: number } }
  | { type: 'UPDATE_SKILLS'; payload: { [skillId: string]: number } }
  | { type: 'UPDATE_LEVEL_SKILLS'; payload: { level: number; skills: { [skillId: string]: number }; remainingPoints: number } }
  | { type: 'ADD_FEAT_TO_LEVEL'; payload: { level: number; featId: string } }
  | { type: 'REMOVE_FEAT_FROM_LEVEL'; payload: { level: number; featId: string } }
  | { type: 'UPDATE_LEVEL_FEATS'; payload: { level: number; feats: string[] } }
  | { type: 'RESET_CHARACTER' }
  | { type: 'SET_VALIDATION'; payload: ValidationResult };

// État du contexte
interface CharacterState {
  currentCharacter: Character | null;
  validation: ValidationResult | null;
  isModified: boolean;
}

// État initial
const initialState: CharacterState = {
  currentCharacter: null,
  validation: null,
  isModified: false
};

// Reducer
function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'CREATE_CHARACTER': {
      const baseCharacter = createBaseCharacter(action.payload.name, action.payload.raceId);
      const newCharacter: Character = {
        ...baseCharacter,
        id: `char_${Date.now()}`,
        nom: action.payload.name,
        race: action.payload.raceId,
        attributsBase: baseCharacter.attributsBase!,
        niveaux: [],
        niveauTotal: 0,
        pointsVieTotal: 0,
        bonusAttaqueBase: 0,
        jetsSauvegardeFinaux: {
          vigueur: 0,
          reflexes: 0,
          volonte: 0
        },
        competences: {},
        dateCreation: new Date(),
        derniereModification: new Date(),
        version: '1.0'
      };
      
      return {
        ...state,
        currentCharacter: newCharacter,
        isModified: true,
        validation: null
      };
    }
    
    case 'LOAD_CHARACTER':
      return {
        ...state,
        currentCharacter: action.payload,
        isModified: false,
        validation: null
      };
    
    case 'UPDATE_ATTRIBUTES': {
      if (!state.currentCharacter) return state;
      
      const updatedCharacter = {
        ...state.currentCharacter,
        attributsBase: {
          ...state.currentCharacter.attributsBase,
          ...action.payload
        },
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }
    
    case 'UPDATE_RACE': {
      if (!state.currentCharacter) return state;
      
      let updatedCharacter = {
        ...state.currentCharacter,
        race: action.payload.raceId,
        derniereModification: new Date()
      };
      
      // Appliquer les dons raciaux automatiquement
      if (updatedCharacter.niveaux.length > 0) {
        updatedCharacter = applyRacialFeats(updatedCharacter);
      }
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }
    
    case 'ADD_LEVEL': {
      if (!state.currentCharacter) return state;
      
      const newLevel = {
        niveau: state.currentCharacter.niveaux.length + 1,
        classe: action.payload.classe,
        pointsVieGagnes: action.payload.pointsVieGagnes,
        competencesAmeliorees: {},
        donsChoisis: [],
        ...(state.currentCharacter.niveaux.length % 4 === 3 && {
          attributAugmente: 'force' as const // Par défaut, sera modifiable
        })
      };
      
      let updatedCharacter = {
        ...state.currentCharacter,
        niveaux: [...state.currentCharacter.niveaux, newLevel],
        niveauTotal: state.currentCharacter.niveaux.length + 1,
        derniereModification: new Date()
      };
      
      // Ajouter automatiquement les dons requis par les proficiencies de classe
      updatedCharacter = addMissingAutomaticFeats(updatedCharacter, allClasses as ClassNWN[]);
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }
    
    case 'UPDATE_SKILLS': {
      if (!state.currentCharacter) return state;
      
      const updatedCharacter = {
        ...state.currentCharacter,
        competences: {
          ...state.currentCharacter.competences,
          ...action.payload
        },
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }

    case 'UPDATE_LEVEL_SKILLS': {
      if (!state.currentCharacter) return state;
      
      const { level, skills, remainingPoints } = action.payload;
      const levelIndex = level - 1;
      
      // Mettre à jour le niveau spécifique
      const updatedLevels = [...state.currentCharacter.niveaux];
      if (updatedLevels[levelIndex]) {
        updatedLevels[levelIndex] = {
          ...updatedLevels[levelIndex],
          competencesAmeliorees: {
            ...updatedLevels[levelIndex].competencesAmeliorees,
            ...skills
          },
          pointsCompetencesNonDepenses: remainingPoints
        };
      }
      
      // Recalculer le total des compétences
      const totalSkills: { [skillId: string]: number } = {};
      updatedLevels.forEach(niveau => {
        if (niveau.competencesAmeliorees) {
          Object.entries(niveau.competencesAmeliorees).forEach(([skillId, ranks]) => {
            totalSkills[skillId] = (totalSkills[skillId] || 0) + (ranks as number);
          });
        }
      });
      
      const updatedCharacter = {
        ...state.currentCharacter,
        niveaux: updatedLevels,
        competences: totalSkills,
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }

    case 'ADD_FEAT_TO_LEVEL': {
      if (!state.currentCharacter) return state;
      
      const { level, featId } = action.payload;
      const levelIndex = level - 1;
      
      if (levelIndex < 0 || levelIndex >= state.currentCharacter.niveaux.length) {
        return state;
      }
      
      const updatedLevels = [...state.currentCharacter.niveaux];
      const currentLevel = updatedLevels[levelIndex];
      
      // Vérifier si le don n'est pas déjà présent
      if (currentLevel.donsChoisis.includes(featId)) {
        return state;
      }
      
      updatedLevels[levelIndex] = {
        ...currentLevel,
        donsChoisis: [...currentLevel.donsChoisis, featId]
      };
      
      const updatedCharacter = {
        ...state.currentCharacter,
        niveaux: updatedLevels,
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }

    case 'REMOVE_FEAT_FROM_LEVEL': {
      if (!state.currentCharacter) return state;
      
      const { level, featId } = action.payload;
      const levelIndex = level - 1;
      
      if (levelIndex < 0 || levelIndex >= state.currentCharacter.niveaux.length) {
        return state;
      }
      
      const updatedLevels = [...state.currentCharacter.niveaux];
      const currentLevel = updatedLevels[levelIndex];
      
      updatedLevels[levelIndex] = {
        ...currentLevel,
        donsChoisis: currentLevel.donsChoisis.filter(id => id !== featId)
      };
      
      const updatedCharacter = {
        ...state.currentCharacter,
        niveaux: updatedLevels,
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }

    case 'UPDATE_LEVEL_FEATS': {
      if (!state.currentCharacter) return state;
      
      const { level, feats } = action.payload;
      const levelIndex = level - 1;
      
      if (levelIndex < 0 || levelIndex >= state.currentCharacter.niveaux.length) {
        return state;
      }
      
      const updatedLevels = [...state.currentCharacter.niveaux];
      updatedLevels[levelIndex] = {
        ...updatedLevels[levelIndex],
        donsChoisis: feats
      };
      
      const updatedCharacter = {
        ...state.currentCharacter,
        niveaux: updatedLevels,
        derniereModification: new Date()
      };
      
      return {
        ...state,
        currentCharacter: updatedCharacter,
        isModified: true
      };
    }
    
    case 'RESET_CHARACTER':
      return {
        ...initialState
      };
    
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: action.payload
      };
    
    default:
      return state;
  }
}

// Interface du contexte
interface CharacterContextType {
  state: CharacterState;
  createCharacter: (name: string, raceId: string) => void;
  loadCharacter: (character: Character) => void;
  updateAttributes: (attributes: Partial<Character['attributsBase']>) => void;
  updateRace: (raceId: string) => void;
  addLevel: (classe: string, pointsVieGagnes: number) => void;
  updateSkills: (skills: { [skillId: string]: number }) => void;
  updateLevelSkills: (level: number, skills: { [skillId: string]: number }, remainingPoints: number) => void;
  addFeatToLevel: (level: number, featId: string) => void;
  removeFeatFromLevel: (level: number, featId: string) => void;
  updateLevelFeats: (level: number, feats: string[]) => void;
  resetCharacter: () => void;
  validateCharacter: () => void;
  saveCharacter: () => Promise<void>;
  loadCharacterFromStorage: (characterId: string) => Promise<void>;
  addMissingAutomaticFeatsToCharacter: () => void;
}

// Création du contexte
const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// Provider
interface CharacterProviderProps {
  children: ReactNode;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [state, dispatch] = useReducer(characterReducer, initialState);
  
  const createCharacter = useCallback((name: string, raceId: string) => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name, raceId } });
  }, []);
  
  const loadCharacter = useCallback((character: Character) => {
    dispatch({ type: 'LOAD_CHARACTER', payload: character });
  }, []);
  
  const updateAttributes = useCallback((attributes: Partial<Character['attributsBase']>) => {
    dispatch({ type: 'UPDATE_ATTRIBUTES', payload: attributes });
  }, []);
  
  const updateRace = useCallback((raceId: string) => {
    dispatch({ type: 'UPDATE_RACE', payload: { raceId } });
  }, []);
  
  const addLevel = useCallback((classe: string, pointsVieGagnes: number) => {
    dispatch({ type: 'ADD_LEVEL', payload: { classe, pointsVieGagnes } });
  }, []);
  
  const updateSkills = useCallback((skills: { [skillId: string]: number }) => {
    dispatch({ type: 'UPDATE_SKILLS', payload: skills });
  }, []);
  
  const updateLevelSkills = useCallback((level: number, skills: { [skillId: string]: number }, remainingPoints: number) => {
    dispatch({ type: 'UPDATE_LEVEL_SKILLS', payload: { level, skills, remainingPoints } });
  }, []);
  
  const addFeatToLevel = useCallback((level: number, featId: string) => {
    dispatch({ type: 'ADD_FEAT_TO_LEVEL', payload: { level, featId } });
  }, []);
  
  const removeFeatFromLevel = useCallback((level: number, featId: string) => {
    dispatch({ type: 'REMOVE_FEAT_FROM_LEVEL', payload: { level, featId } });
  }, []);
  
  const updateLevelFeats = useCallback((level: number, feats: string[]) => {
    dispatch({ type: 'UPDATE_LEVEL_FEATS', payload: { level, feats } });
  }, []);
  
  const resetCharacter = useCallback(() => {
    dispatch({ type: 'RESET_CHARACTER' });
  }, []);
  
  const validateCharacter = useCallback(() => {
    if (state.currentCharacter) {
      const validation = validateCharacterProgression(state.currentCharacter);
      dispatch({ type: 'SET_VALIDATION', payload: validation });
    }
  }, [state.currentCharacter]);
  
  const saveCharacter = useCallback(async () => {
    if (state.currentCharacter) {
      try {
        // Sauvegarde dans le localStorage pour l'instant
        const savedCharacters = JSON.parse(localStorage.getItem('nwn_characters') || '[]');
        const existingIndex = savedCharacters.findIndex((c: Character) => c.id === state.currentCharacter!.id);
        
        if (existingIndex >= 0) {
          savedCharacters[existingIndex] = state.currentCharacter;
        } else {
          savedCharacters.push(state.currentCharacter);
        }
        
        localStorage.setItem('nwn_characters', JSON.stringify(savedCharacters));
        console.log('Personnage sauvegardé:', state.currentCharacter.nom);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  }, [state.currentCharacter]);
  
  const loadCharacterFromStorage = useCallback(async (characterId: string) => {
    try {
      const savedCharacters = JSON.parse(localStorage.getItem('nwn_characters') || '[]');
      const character = savedCharacters.find((c: Character) => c.id === characterId);
      
      if (character) {
        // Reconvertir les dates
        character.dateCreation = new Date(character.dateCreation);
        character.derniereModification = new Date(character.derniereModification);
        loadCharacter(character);
      } else {
        console.error('Personnage non trouvé:', characterId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  }, [loadCharacter]);
  
  const addMissingAutomaticFeatsToCharacter = useCallback(() => {
    if (state.currentCharacter) {
      const updatedCharacter = addMissingAutomaticFeats(state.currentCharacter, allClasses as ClassNWN[]);
      dispatch({ type: 'LOAD_CHARACTER', payload: updatedCharacter });
    }
  }, [state.currentCharacter]);
  
  const contextValue: CharacterContextType = {
    state,
    createCharacter,
    loadCharacter,
    updateAttributes,
    updateRace,
    addLevel,
    updateSkills,
    updateLevelSkills,
    addFeatToLevel,
    removeFeatFromLevel,
    updateLevelFeats,
    resetCharacter,
    validateCharacter,
    saveCharacter,
    loadCharacterFromStorage,
    addMissingAutomaticFeatsToCharacter
  };
  
  return (
    <CharacterContext.Provider value={contextValue}>
      {children}
    </CharacterContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
