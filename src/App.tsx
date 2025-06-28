// src/App.tsx
import { useState } from 'react';
import { DonList } from './components/DonList';
import { DonDetails } from './components/DonDetails';
import { SortList } from './components/SortList';
import { SortDetails } from './components/SortDetails';
import listeDons from './data/listeDons.json';
import listeSorts from './data/listeSorts.json';
import type { Don } from './models/Don';
import type { Sort } from './models/Sort';
import './index.css';

// Icônes SVG inline
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" stroke="currentColor" />
    <path stroke="currentColor" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path stroke="currentColor" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
  </svg>
);

const App = () => {
  const [donSelectionne, setDonSelectionne] = useState<Don | null>(null);
  const [sortSelectionne, setSortSelectionne] = useState<Sort | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState<'dons' | 'sorts'>('dons');

  // Ajoute ou retire la classe dark sur le body
  if (typeof document !== "undefined") {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  // Gestion affichage Dons/Sorts
  const showDons = tab === 'dons';
  const showSorts = tab === 'sorts';

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white py-4 mb-6 relative`}>
        <h1 className="text-center text-3xl font-bold">Solarune Character Builder</h1>
        {/* Boutons mode clair/sombre en haut à droite */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className={`p-2 rounded-full border transition ${!darkMode ? 'bg-white text-gray-900 border-blue-400' : 'bg-gray-700 text-white border-gray-500'} hover:shadow`}
            onClick={() => setDarkMode(false)}
            aria-label="Mode clair"
            title="Mode clair"
          >
            <SunIcon />
          </button>
          <button
            className={`p-2 rounded-full border transition ${darkMode ? 'bg-gray-700 text-white border-yellow-400' : 'bg-white text-gray-900 border-gray-400'} hover:shadow`}
            onClick={() => setDarkMode(true)}
            aria-label="Mode sombre"
            title="Mode sombre"
          >
            <MoonIcon />
          </button>
        </div>
        {/* Tabs Dons/Sorts */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            className={`px-4 py-2 rounded font-bold border transition ${tab === 'dons'
              ? 'bg-white text-blue-700 border-blue-400 shadow'
              : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
            }`}
            onClick={() => { setTab('dons'); setDonSelectionne(null); setSortSelectionne(null); }}
          >
            Dons
          </button>
          <button
            className={`px-4 py-2 rounded font-bold border transition ${tab === 'sorts'
              ? 'bg-white text-blue-700 border-blue-400 shadow'
              : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
            }`}
            onClick={() => { setTab('sorts'); setDonSelectionne(null); setSortSelectionne(null); }}
          >
            Sorts
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Affichage Dons */}
        {showDons && (
          donSelectionne ? (
            <DonDetails don={donSelectionne} onBack={() => setDonSelectionne(null)} allDons={listeDons} />
          ) : (
            Array.isArray(listeDons) && listeDons.length > 0 ? (
              <DonList dons={listeDons} onSelectDon={setDonSelectionne} />
            ) : (
              <div className="text-center text-red-600 font-bold">
                Aucun don trouvé dans les données (ou données mal importées).
              </div>
            )
          )
        )}
        {/* Affichage Sorts */}
        {showSorts && (
          sortSelectionne ? (
            <SortDetails sort={sortSelectionne} onBack={() => setSortSelectionne(null)} allSorts={listeSorts} />
          ) : (
            Array.isArray(listeSorts) && listeSorts.length > 0 ? (
              <SortList sorts={listeSorts} onSelectSort={setSortSelectionne} />
            ) : (
              <div className="text-center text-red-600 font-bold">
                Aucun sort trouvé dans les données (ou données mal importées).
              </div>
            )
          )
        )}
      </main>
    </div>
  );
}

export default App;

// --- À créer : SortList, SortDetails, models/Sort.ts, data/listeSorts.json ---
