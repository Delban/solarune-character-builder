export interface Sort {
  id: string;
  nom: string;
  type?: string;
  niveaux?: { [key: string]: number | undefined }; // Permet les propriétés undefined
  niveauInne?: number;
  ecole?: string; // ex: "Évocation"
  composantes?: string[];
  tempsIncantation?: string;
  portee?: string;
  cible?: string;
  zoneEffetCible?: string;
  duree?: string;
  jetSauvegarde?: string;
  resistanceMagie?: string;
  contresortSupplementaire?: string;
  description?: string;
  fonctionnement: string;
  utilisation: string;
  special?: string;
}
