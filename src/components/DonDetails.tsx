// src/components/DonDetails.tsx
import React, { useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BackIcon } from './icons/Icons';
import type { Don } from '../models/Don';

interface DonDetailsProps {
  don: Don;
  onBack: () => void;
  allDons: Don[]; // Ajout de la liste complète des dons
}

const DonDetails = React.memo(({ don, onBack, allDons }: DonDetailsProps) => {
  const { darkMode } = useTheme();

  // Fonction utilitaire mémorisée pour retrouver le nom à partir de l'id
  const getDonNom = useCallback((id: string) => {
    const found = allDons.find(d => d.id === id);
    return found ? found.nom : id;
  }, [allDons]);

  // Mémorise les caractéristiques requises formatées
  const formattedCaracteristiques = useMemo(() => {
    if (!don.conditionsCaractéristiques || Object.keys(don.conditionsCaractéristiques).length === 0) {
      return null;
    }

    return Object.entries(don.conditionsCaractéristiques).map(([carac, val]) => ({
      carac: carac === "bonus_base_attaque"
        ? "Bonus d'Attaque de Base (BAB)"
        : carac.charAt(0).toUpperCase() + carac.slice(1),
      val
    }));
  }, [don.conditionsCaractéristiques]);

  const containerClasses = `${
    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
  } rounded-lg shadow-lg p-6`;

  const buttonClasses = `flex items-center gap-2 mb-6 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
    darkMode
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`;

  const typeClasses = darkMode ? "text-blue-200 mb-4" : "text-gray-600 mb-4";

  const specialClasses = `mt-4 ${
    darkMode ? "bg-yellow-900 border-yellow-700" : "bg-yellow-100 border-yellow-500"
  } border-l-4 p-3`;

  return (
    <div className={containerClasses}>
      <button onClick={onBack} className={buttonClasses}>
        <BackIcon className="w-4 h-4" />
        Retour à la liste
      </button>
      
      <h2 className="text-2xl font-bold mb-2">{don.nom}</h2>
      <p className={typeClasses}>{don.type}</p>

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
      {formattedCaracteristiques && (
        <div className="mb-2">
          <span className="font-semibold">Caractéristiques requises : </span>
          <ul className="list-disc list-inside">
            {formattedCaracteristiques.map(({ carac, val }) => (
              <li key={carac}>
                {carac} : {val}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!don.conditionsId?.length && !formattedCaracteristiques) && (
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
        <p className="whitespace-pre-wrap mt-2">{don.fonctionnement}</p>
      </div>

      <p className="mb-4">
        <span className="font-semibold">Utilisation : </span>
        {don.utilisation}
      </p>

      {don.special && (
        <div className={specialClasses}>
          <p className="font-semibold">Spécial :</p>
          <p className="whitespace-pre-wrap">{don.special}</p>
        </div>
      )}
    </div>
  );
});

DonDetails.displayName = 'DonDetails';

export { DonDetails };
