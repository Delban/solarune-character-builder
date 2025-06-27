// src/components/DonCard.tsx
import type { Don } from '../models/Don';

interface DonCardProps {
  don: Don;
  onClick?: (d: Don) => void;
}

export function DonCard({ don, onClick }: DonCardProps) {
  // Ajoute un event stopPropagation pour éviter d'ouvrir le détail lors du clic sur un tag
  const handleTagClick = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    // Déclenche un event personnalisé pour le filtre par type
    const customEvent = new CustomEvent('filterByType', { detail: type.trim() });
    window.dispatchEvent(customEvent);
  };

  return (
    <div
      className={`rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border p-6 cursor-pointer
        ${document.body.classList.contains('dark')
          ? 'bg-gray-800 border-gray-700 text-gray-100'
          : 'bg-white border-gray-100 text-gray-900'
        }`
      }
      onClick={() => onClick && onClick(don)}
    >
      <h2 className="text-lg font-bold mb-2">{don.nom}</h2>
      <div className="flex flex-wrap gap-2 mb-1">
        {don.type.split(',').map((type, idx) => (
          <span
            key={idx}
            className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer transition
              ${document.body.classList.contains('dark')
                ? 'bg-blue-900 text-blue-100 border-blue-700 hover:bg-blue-800'
                : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
              }`
            }
            onClick={(e) => handleTagClick(e, type)}
            title={`Filtrer par "${type.trim()}"`}
          >
            {type.trim()}
          </span>
        ))}
      </div>
      <p className={document.body.classList.contains('dark') ? "text-gray-300" : "text-gray-600"}>
        {don.description || don.fonctionnement}
      </p>
      {/* ...other fields as needed... */}
    </div>
  );
}
