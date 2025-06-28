import type { Sort } from '../models/Sort';

interface SortDetailsProps {
  sort: Sort;
  onBack: () => void;
  allSorts: Sort[];
}

export function SortDetails({ sort, onBack }: SortDetailsProps) {
  const isDark = typeof document !== "undefined" && document.body.classList.contains('dark');
  
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
    <div className={`${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"} rounded-lg shadow-lg p-6`}>
      <button
        onClick={onBack}
        className={`flex items-center mb-6 px-4 py-2 font-medium rounded-lg transition-colors
          ${isDark
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
      >
        ← Retour à la liste
      </button>
      <h2 className="text-2xl font-bold mb-2">{sort.nom}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
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
      
      {/* Informations détaillées du sort */}
      <div className="space-y-4">
        {sort.composantes && (
          <div>
            <span className="font-semibold">Composantes : </span>
            <span>{sort.composantes.join(', ')}</span>
          </div>
        )}
        
        {sort.tempsIncantation && (
          <div>
            <span className="font-semibold">Temps d'incantation : </span>
            <span>{sort.tempsIncantation}</span>
          </div>
        )}
        
        {sort.portee && (
          <div>
            <span className="font-semibold">Portée : </span>
            <span>{sort.portee}</span>
          </div>
        )}
        
        {sort.cible && (
          <div>
            <span className="font-semibold">Cible : </span>
            <span>{sort.cible}</span>
          </div>
        )}
        
        {sort.zoneEffetCible && (
          <div>
            <span className="font-semibold">Zone d'effet/Cible : </span>
            <span>{sort.zoneEffetCible}</span>
          </div>
        )}
        
        {sort.duree && (
          <div>
            <span className="font-semibold">Durée : </span>
            <span>{sort.duree}</span>
          </div>
        )}
        
        {sort.jetSauvegarde && (
          <div>
            <span className="font-semibold">Jet de sauvegarde : </span>
            <span>{sort.jetSauvegarde}</span>
          </div>
        )}
        
        {sort.resistanceMagie && (
          <div>
            <span className="font-semibold">Résistance à la magie : </span>
            <span>{sort.resistanceMagie}</span>
          </div>
        )}
        
        {sort.contresortSupplementaire && (
          <div>
            <span className="font-semibold">Contresort supplémentaire : </span>
            <span>{sort.contresortSupplementaire}</span>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <span className="font-semibold">Fonctionnement : </span>
        <p className="whitespace-pre-wrap mt-2">{sort.fonctionnement}</p>
      </div>
      
      <p className="mt-4">
        <span className="font-semibold">Utilisation : </span>
        {sort.utilisation}
      </p>
      
      {sort.special && (
        <div className={`mt-4 ${isDark ? "bg-yellow-900 border-yellow-700" : "bg-yellow-100 border-yellow-500"} border-l-4 p-3`}>
          <p className="font-semibold">Spécial :</p>
          <p className="whitespace-pre-wrap">{sort.special}</p>
        </div>
      )}
    </div>
  );
}
