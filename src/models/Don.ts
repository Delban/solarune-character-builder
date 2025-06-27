// src/models/Don.ts

export interface Don {
  id: string;               // identifiant unique du don (ex: "ambidexterie")
  nom: string;              // nom affiché du don (ex: "Ambidexterie")
  type: string;             // catégories du don (ex: "Général, Guerrier")
  description?: string;     // description textuelle (optionnelle)
  condition?: string;       // conditions textuelles (optionnelles, ex: "Dex 15+")
  conditionsId?: [string];  // liste d'identifiants d'autres dons requis (optionnel, devrait être string[])
  conditionsCaractéristiques?: { // caractéristiques minimales requises (optionnel)
    dexterite?: number;
    force?: number;
    constitution?: number;
    sagesse?: number;
    intelligence?: number;
    charisme?: number;
  };
  requisPour?: string;      // identifiant(s) de dons pour lesquels celui-ci est un prérequis (optionnel, devrait être string[])
  fonctionnement: string;   // explication du fonctionnement du don
  utilisation: string;      // mode d'utilisation (ex: "Automatique", "Si sélectionné")
  special?: string;         // informations spéciales (optionnel)
  // ...ajoute d'autres champs si besoin
}
