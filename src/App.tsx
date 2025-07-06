// src/App.tsx
import { useState, useMemo } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SunIcon, MoonIcon } from './components/icons/Icons';
import { 
  DonListLazy, 
  DonDetailsLazy, 
  SortListLazy, 
  SortDetailsLazy, 
  CharacterBuilderLazy 
} from './components/LazyComponents';
import listeDons from './data/listeDons.json';
import listeSorts from './data/listeSorts.json';
import type { Don } from './models/Don';
import type { Sort } from './models/Sort';
import './index.css';

function AppContent() {
  const [donSelectionne, setDonSelectionne] = useState<Don | null>(null);
  const [sortSelectionne, setSortSelectionne] = useState<Sort | null>(null);
  const [tab, setTab] = useState<'dons' | 'sorts' | 'character-builder'>('character-builder');
  const { darkMode, setDarkMode } = useTheme();

  // Mémorise les données pour éviter les re-calculs
  const donsData = useMemo(() => listeDons as Don[], []);
  const sortsData = useMemo(() => listeSorts as Sort[], []);

  // Callbacks optimisés avec useCallback implicite dans les handlers
  const handleTabChange = (newTab: 'dons' | 'sorts' | 'character-builder') => {
    setTab(newTab);
    setDonSelectionne(null);
    setSortSelectionne(null);
  };

  const showDons = tab === 'dons';
  const showSorts = tab === 'sorts';
  const showCharacterBuilder = tab === 'character-builder';

  const isDataValid = (data: unknown[]): boolean => Array.isArray(data) && data.length > 0;

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white py-4 mb-6 relative`}>
        <h1 className="text-center text-3xl font-bold">Solarune Character Builder</h1>
        
        {/* Boutons mode clair/sombre optimisés */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className={`p-2 rounded-full border transition-all duration-200 ${
              !darkMode 
                ? 'bg-white text-gray-900 border-blue-400 shadow-md' 
                : 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600'
            } hover:shadow-lg`}
            onClick={() => setDarkMode(false)}
            aria-label="Mode clair"
            title="Mode clair"
          >
            <SunIcon />
          </button>
          <button
            className={`p-2 rounded-full border transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-700 text-white border-yellow-400 shadow-md' 
                : 'bg-white text-gray-900 border-gray-400 hover:bg-gray-50'
            } hover:shadow-lg`}
            onClick={() => setDarkMode(true)}
            aria-label="Mode sombre"
            title="Mode sombre"
          >
            <MoonIcon />
          </button>
        </div>
        
        {/* Tabs optimisés */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            className={`px-6 py-2 rounded-lg font-bold border transition-all duration-200 ${
              tab === 'character-builder'
                ? 'bg-white text-blue-700 border-blue-400 shadow-md transform scale-105'
                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:scale-102'
            }`}
            onClick={() => handleTabChange('character-builder')}
          >
            🎭 Character Builder
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-bold border transition-all duration-200 ${
              tab === 'dons'
                ? 'bg-white text-blue-700 border-blue-400 shadow-md transform scale-105'
                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:scale-102'
            }`}
            onClick={() => handleTabChange('dons')}
          >
            Dons ({donsData.length})
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-bold border transition-all duration-200 ${
              tab === 'sorts'
                ? 'bg-white text-blue-700 border-blue-400 shadow-md transform scale-105'
                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:scale-102'
            }`}
            onClick={() => handleTabChange('sorts')}
          >
            Sorts ({sortsData.length})
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Character Builder */}
        {showCharacterBuilder && <CharacterBuilderLazy />}
        
        {/* Affichage Dons */}
        {showDons && (
          donSelectionne ? (
            <DonDetailsLazy 
              don={donSelectionne} 
              onBack={() => setDonSelectionne(null)} 
              allDons={donsData} 
            />
          ) : (
            isDataValid(donsData) ? (
              <DonListLazy dons={donsData} onSelectDon={setDonSelectionne} />
            ) : (
              <div className="text-center text-red-600 font-bold bg-red-50 p-6 rounded-lg">
                ⚠️ Aucun don trouvé dans les données (ou données mal importées).
              </div>
            )
          )
        )}
        
        {/* Affichage Sorts */}
        {showSorts && (
          sortSelectionne ? (
            <SortDetailsLazy 
              sort={sortSelectionne} 
              onBack={() => setSortSelectionne(null)} 
              allSorts={sortsData} 
            />
          ) : (
            isDataValid(sortsData) ? (
              <SortListLazy sorts={sortsData} onSelectSort={setSortSelectionne} />
            ) : (
              <div className="text-center text-red-600 font-bold bg-red-50 p-6 rounded-lg">
                ⚠️ Aucun sort trouvé dans les données (ou données mal importées).
              </div>
            )
          )
        )}
      </main>
    </div>
  );
}

const App = () => (
  <ThemeProvider>
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  </ThemeProvider>
);

export default App;
