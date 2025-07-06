# Documentation des Compétences - Character Builder Neverwinter Nights

## Vue d'ensemble

Le système de compétences du Character Builder implémente les règles de Neverwinter Nights (D&D 3.0) pour la gestion des compétences de personnage, incluant :

- Calcul automatique des points de compétences disponibles par niveau
- Distinction entre compétences de classe et hors-classe  
- Respect des plafonds de rangs par niveau
- Application des coûts (1 pt/rang classe, 2 pts/rang hors-classe)
- Persistance des rangs et points non dépensés

## Architecture

### Modèles de données

#### `Skills.ts`
```typescript
export interface SkillRanks {
  [skillId: string]: number; // skillId -> nombre de rangs
}

export interface SkillPointsInfo {
  basePoints: number;        // Points de base de la classe
  intModifier: number;       // Modificateur d'Intelligence
  totalPoints: number;       // Total disponible (incluant quadruple au niveau 1)
  spentPoints: number;       // Points déjà dépensés
  remainingPoints: number;   // Points restants
  isFirstLevel: boolean;     // Si c'est le niveau 1 (quadruple)
}
```

#### `Character.ts` (modifié)
```typescript
export interface CharacterLevel {
  // ... autres champs existants
  competencesAmeliorees: { [competence: string]: number };
  pointsCompetencesNonDepenses?: number; // Points non utilisés à ce niveau
}
```

### Utilitaires de calcul

#### `skillCalculations.ts`

**Fonction principale :**
```typescript
calculateSkillPointsForLevel(character: Character, level: number): SkillPointsInfo
```

Calcule les points de compétences disponibles pour un niveau donné :
- Points de base de la classe (ex: Roublard = 8, Sorcier = 2)
- Modificateur d'Intelligence (minimum 1 point au total)
- Bonus racial (+1 pour humain)
- Quadruple au niveau 1

**Exemples :**
- Roublard Humain Int 16 niveau 1 : (8 + 3 + 1) × 4 = 48 points
- Sorcier Humain Int 14 niveau 1 : (2 + 2 + 1) × 4 = 20 points
- Même personnage niveau 2 : (8 + 3 + 1) = 12 points (pas quadruplé)

## Composants React

### `SkillSelector`

Interface principale pour la répartition des compétences à un niveau donné.

**Props :**
```typescript
interface SkillSelectorProps {
  level: number;                    // Niveau pour lequel on assigne
  onComplete?: (skillRanks: SkillRanks, remainingPoints: number) => void;
  readonly?: boolean;               // Mode lecture seule
  title?: string;                   // Titre personnalisé
}
```

**Fonctionnalités :**
- Affichage des compétences avec indicateurs classe/hors-classe
- Contrôles +/- pour ajuster les rangs
- Validation en temps réel des limites et coûts
- Affichage des points restants avec avertissements visuels

### `SkillManagement` 

Composant de gestion globale des compétences dans le Character Builder.

**Fonctionnalités :**
- Vue d'ensemble des niveaux nécessitant une répartition
- Accès modal au SkillSelector pour chaque niveau
- Résumé des compétences du personnage
- Indicateurs visuels des niveaux incomplets

### `SkillLevelUp`

Modal wrapper pour l'assignation de compétences lors d'une montée de niveau.

## Règles et Contraintes

### Points de compétences

**Calcul par niveau :**
```
Points = max(1, points_classe + mod_intelligence) + bonus_racial
```

**Niveau 1 :** Points × 4
**Niveaux suivants :** Points normaux

### Coûts et limites

**Coût par rang :**
- Compétence de classe : 1 point
- Compétence hors-classe : 2 points

**Rangs maximum :**
- Compétence de classe : niveau + 3
- Compétence hors-classe : ⌊(niveau + 3)/2⌋

### Compétences de classe

Définies dans `classesNWN.json` sous le champ `skills` pour chaque classe.

Exemples :
- **Roublard :** `discretion`, `crochetage`, `fouille`, `acrobaties`, etc.
- **Sorcier :** `bluff`, `concentration`, `savoir`, `utilisation_objets_magiques`

## Intégration au Character Builder

### Workflow de création

1. **Création personnage :** Assignation des compétences niveau 1 (points quadruplés)
2. **Montée de niveau :** Assignation pour chaque nouveau niveau
3. **Persistance :** Sauvegarde des rangs par niveau et points non dépensés

### État et Contexte

```typescript
// Nouvelle action dans CharacterContext
updateLevelSkills(level: number, skills: SkillRanks, remainingPoints: number)
```

Met à jour :
- `competencesAmeliorees` du niveau spécifique
- `pointsCompetencesNonDepenses` du niveau
- `competences` global du personnage (total cumulé)

## Tests et Validation

### Cas de test principaux

1. **Roublard Humain Int 16 :**
   - Niveau 1 : 48 points (validation plafonds et coûts)
   - Compétences de classe vs hors-classe

2. **Sorcier Humain Int 14 :**
   - Niveau 1 : 20 points
   - Focus sur compétences limitées

3. **Personnage multiclassé :**
   - Changement de compétences de classe par niveau
   - Persistance correcte entre niveaux

4. **Cas limites :**
   - Intelligence très basse (minimum 1 point)
   - Validation des plafonds de rangs
   - Points insuffisants

### Validation en temps réel

- Vérification des points disponibles
- Respect des plafonds de rangs
- Indication visuelle des erreurs
- Prévention de la validation si dépassement

## Localisation

### Chaînes FR/EN

Les noms de compétences et messages d'interface supportent la localisation via les fichiers de traduction existants.

**Exemple :**
```json
{
  "skills.discretion": { "fr": "Discrétion", "en": "Hide" },
  "skills.points_remaining": { "fr": "Points restants", "en": "Points remaining" }
}
```

## Performances

### Optimisations

- Calculs mémorisés avec `useMemo`
- Debounce des interactions utilisateur
- Lazy loading des composants
- Validation différée

### Structure de données

- Stockage par niveau pour éviter les recalculs
- Index des compétences de classe par classe
- Cache des modificateurs d'attributs

## Extensibilité

### Ajout de nouvelles compétences

1. Ajouter dans `BASE_SKILLS` (Skills.ts)
2. Mettre à jour les listes de compétences de classe (classesNWN.json)
3. Ajouter les traductions

### Règles personnalisées

Le système supporte l'extension pour :
- Bonus raciaux spécifiques aux compétences
- Malus d'armure
- Compétences nécessitant une formation
- Synergies entre compétences

## Dépannage

### Problèmes courants

**Erreur "Classe non trouvée" :**
- Vérifier que la classe existe dans `classesNWN.json`
- Contrôler l'ID de classe dans `character.niveaux`

**Points de compétences incorrects :**
- Vérifier le modificateur d'Intelligence
- Contrôler le bonus racial (humain +1)
- Valider la quadruple au niveau 1

**Compétences de classe incorrectes :**
- Vérifier le champ `skills` dans la définition de classe
- Contrôler la correspondance des IDs de compétences

### Debug

```typescript
// Activer les logs de debug
localStorage.setItem('debug-skills', 'true');
```

Affiche dans la console :
- Calculs de points par niveau
- Résolution des compétences de classe
- Validation des rangs et coûts
