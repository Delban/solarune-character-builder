// src/App.tsx
import { useState } from 'react';
import { DonList } from './components/DonList';
import { DonDetails } from './components/DonDetails';
import listeDons from './data/listeDons.json';
import type { Don } from './models/Don';
import './index.css';



const App = () => {
  const [donSelectionne, setDonSelectionne] = useState<Don | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleSelectDon = (don: Don) => {
    setDonSelectionne(don);
  };

  const handleBack = () => {
    setDonSelectionne(null);
  };

  // Ajoute ou retire la classe dark sur le body
  if (typeof document !== "undefined") {
    document.body.classList.toggle('dark', darkMode);
  }

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white py-4 mb-6`}>
        <h1 className="text-center text-3xl font-bold">Solarune Character Builder</h1>
        <div className="flex justify-center gap-2 mt-4">
          <button
            className={`px-3 py-1 rounded font-bold border ${!darkMode ? 'bg-white text-gray-900 border-blue-400' : 'bg-gray-700 text-white border-gray-500'} transition`}
            onClick={() => setDarkMode(false)}
          >
            Mode clair
          </button>
          <button
            className={`px-3 py-1 rounded font-bold border ${darkMode ? 'bg-gray-700 text-white border-yellow-400' : 'bg-white text-gray-900 border-gray-400'} transition`}
            onClick={() => setDarkMode(true)}
          >
            Mode sombre
          </button>
        </div>
      </header>

    

      <main className="px-4 py-6">
        {donSelectionne ? (
          <DonDetails don={donSelectionne} onBack={handleBack} allDons={listeDons} />
        ) : (
          Array.isArray(listeDons) && listeDons.length > 0 ? (
            <DonList dons={listeDons} onSelectDon={handleSelectDon} />
          ) : (
            <div className="text-center text-red-600 font-bold">
              Aucun don trouvé dans les données (ou données mal importées).
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;
