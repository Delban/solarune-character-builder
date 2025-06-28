// src/components/DonDetails.tsx
import type { Don } from '../models/Don';

interface DonDetailsProps {
  don: Don;
  onBack: () => void;
  allDons: Don[]; // Ajout de la liste complète des dons
}

export function DonDetails({ don, onBack, allDons }: DonDetailsProps) {
  // Fonction utilitaire pour retrouver le nom à partir de l'id
  const getDonNom = (id: string) => {
    const found = allDons.find(d => d.id === id);
    return found ? found.nom : id;
  };

  // Détecte le mode sombre via la classe sur le body
  const isDark = typeof document !== "undefined" && document.body.classList.contains('dark');

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
      
      <h2 className="text-2xl font-bold mb-2">{don.nom}</h2>
      <p className={isDark ? "text-blue-200 mb-4" : "text-gray-600 mb-4"}>{don.type}</p>

      {don.condition && (
        <p className="mb-2">
          <span className="font-semibold">Condition : </span>
          {don.condition}
        </p>
      )}
      {/* Affichage des conditionsId si présentes */}
      {don.conditionsId && don.conditionsId.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Dons requis : </span>
          {don.conditionsId.map(id => getDonNom(id)).join(', ')}
        </div>
      )}

      {/* Affichage des conditionsCaractéristiques si présentes */}
      {don.conditionsCaractéristiques && Object.keys(don.conditionsCaractéristiques).length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Caractéristiques requises : </span>
          <ul className="list-disc list-inside">
            {Object.entries(don.conditionsCaractéristiques).map(([carac, val]) => (
              <li key={carac}>
                {carac === "bonus_base_attaque"
                  ? "Bonus d'Attaque de Base (BAB)"
                  : carac.charAt(0).toUpperCase() + carac.slice(1)
                } : {val}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(!don.conditionsId?.length && 
        (!don.conditionsCaractéristiques || Object.keys(don.conditionsCaractéristiques).length === 0)) && (
        <p className="mb-2 text-gray-500">Aucune condition requise.</p>
      )}
      {/* Affichage du champ "Requis pour" avec les noms */}
      {don.requisPour && don.requisPour.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Requis pour : </span>
          {don.requisPour.map(id => getDonNom(id)).join(', ')}
        </div>
      )}

      <div className="mb-4">
        <span className="font-semibold">Fonctionnement : </span>
        <p className="whitespace-pre-wrap">{don.fonctionnement}</p>
      </div>

      <p className="mb-4">
        <span className="font-semibold">Utilisation : </span>
        {don.utilisation}
      </p>

      {don.special && (
        <div className={`${isDark ? "bg-yellow-900 border-yellow-700" : "bg-yellow-100 border-yellow-500"} border-l-4 p-3`}>
          <p className="font-semibold">Spécial :</p>
          <p className="whitespace-pre-wrap">{don.special}</p>
        </div>
      )}
    </div>
  );
}
