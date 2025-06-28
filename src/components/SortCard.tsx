import type { Sort } from '../models/Sort';

interface SortCardProps {
  sort: Sort;
  onClick?: (s: Sort) => void;
}

export function SortCard({ sort, onClick }: SortCardProps) {
  const isDark = document.body.classList.contains('dark');
  
  // Limite le texte à 80 mots
  const getShortText = (text: string) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= 80) return text;
    return words.slice(0, 80).join(' ') + '…';
  };

  // Fonction pour afficher les niveaux des classes
  const getNiveauxText = () => {
    if (sort.niveauInne) {
      return `Niveau ${sort.niveauInne}`;
    }
    if (sort.niveaux) {
      const niveauxList = Object.entries(sort.niveaux)
        .filter(([, niveau]) => niveau !== undefined)
        .map(([classe, niveau]) => `${classe} ${niveau}`)
        .join(', ');
      return niveauxList || 'Niveau inconnu';
    }
    return 'Niveau inconnu';
  };

  return (
    <div
      className={`rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border p-6 cursor-pointer
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-gray-100'
          : 'bg-white border-gray-100 text-gray-900'
        }`
      }
      onClick={() => onClick && onClick(sort)}
    >
      <h2 className="text-lg font-bold mb-2">{sort.nom}</h2>
      <div className="flex flex-wrap gap-2 mb-1">
        {sort.ecole && (
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
            isDark 
              ? 'bg-purple-900 text-purple-200 border-purple-700' 
              : 'bg-purple-100 text-purple-800 border-purple-300'
          }`}>
            {sort.ecole}
          </span>
        )}
        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
          isDark 
            ? 'bg-green-900 text-green-200 border-green-700' 
            : 'bg-green-100 text-green-800 border-green-300'
        }`}>
          {getNiveauxText()}
        </span>
        {sort.type && (
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
            isDark 
              ? 'bg-blue-900 text-blue-200 border-blue-700' 
              : 'bg-blue-100 text-blue-800 border-blue-300'
          }`}>
            {sort.type}
          </span>
        )}
      </div>
      <p className={isDark ? "text-gray-300" : "text-gray-600"}>
        {getShortText(sort.description || sort.fonctionnement)}
      </p>
    </div>
  );
}
