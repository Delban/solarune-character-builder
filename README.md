# Character Builder Solarune - Neverwinter Nights

Un constructeur de personnage complet pour Neverwinter Nights, optimisé pour le serveur Solarune.

## 🚀 Fonctionnalités

### ✅ Implémentées

- **Création de personnage** : Race, attributs, classe initiale
- **Progression multi-classe** : Montée de niveau flexible jusqu'au niveau 30
- **Gestion des dons** : Sélection des dons généraux et de classe avec validation des prérequis
- **Gestion des compétences** : Système complet de répartition des points de compétences
- **Sorts** : Base de données consultable des sorts par classe et niveau
- **Interface adaptative** : Mode sombre/clair, design responsive
- **Sauvegarde/Chargement** : Persistance locale des personnages

### 🎯 Compétences (Nouveau !)

- **Calcul automatique** des points de compétences par niveau (classe + Int + racial)
- **Points quadruplés** au niveau 1 selon les règles D&D 3.0
- **Distinction classe/hors-classe** avec coûts respectifs (1 pt vs 2 pts)
- **Plafonds de rangs** : niveau+3 (classe) ou ⌊(niveau+3)/2⌋ (hors-classe)  
- **Validation temps réel** des limites et points disponibles
- **Interface intuitive** avec indicateurs visuels
- **Persistance** des rangs et points non dépensés par niveau

## 🏗️ Architecture

### Technologies
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** pour le styling
- **ESLint** pour la qualité du code
- Architecture basée sur les contextes React

### Structure des données
- **Modèles typés** : Character, Skills, Don, Sort, Classes
- **Calculs optimisés** : Utils avec mémoisation
- **État persistant** : Local Storage avec versioning

## 📚 Documentation

- [`SKILLS_DOCUMENTATION.md`](SKILLS_DOCUMENTATION.md) - Documentation technique des compétences
- [`USER_GUIDE_SKILLS.md`](USER_GUIDE_SKILLS.md) - Guide utilisateur pour les compétences
- [`src/examples/skillCalculationExamples.ts`](src/examples/skillCalculationExamples.ts) - Exemples et tests de calculs

## 🚀 Installation et Démarrage

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🧪 Tests et Exemples

### Tests intégrés
Dans la console du navigateur :
```javascript
// Exécuter les tests de compétences
runSkillTests()

// Test de performance
performanceTest()

// Créer un personnage de test
const rogue = createTestCharacter('humain', 'rogue', 16, 1)
```

### Cas de test validés
- ✅ Roublard Humain Int 16 : 48 points niveau 1
- ✅ Sorcier Humain Int 14 : 20 points niveau 1  
- ✅ Multiclassage avec différentes compétences de classe
- ✅ Minimum 1 point même avec Intelligence très basse
- ✅ Validation des plafonds et coûts

## 🎮 Guide d'utilisation

### Créer un personnage
1. Choisir la race et saisir le nom
2. Répartir les 32 points d'attributs (method point-buy)
3. Sélectionner la classe initiale
4. **Répartir les compétences** (onglet Compétences)
5. Choisir les dons de départ

### Monter de niveau
1. Cliquer "Ajouter Niveau" et choisir la classe
2. **Répartir les nouvelles compétences** si nécessaire  
3. Sélectionner les nouveaux dons disponibles

### Gestion des compétences
- **Onglet Compétences** : Vue d'ensemble et gestion par niveau
- **Niveaux en jaune** : Points de compétences non répartis
- **Niveaux en vert** : Compétences complètement assignées
- **Coûts** : 1 pt/rang (classe), 2 pts/rang (hors-classe)
- **Limites** : Voir guide utilisateur détaillé

## 🔧 Développement

### Structure du projet
```
src/
├── components/           # Composants React
│   ├── character-builder/   # Composants de création
│   │   ├── SkillSelector.tsx     # Interface de sélection
│   │   ├── SkillManagement.tsx   # Gestion globale
│   │   └── SkillLevelUp.tsx      # Modal de montée niveau
├── contexts/            # Contextes React (state management)
├── data/               # Données statiques (classes, dons, sorts)  
├── models/             # Types TypeScript
├── utils/              # Utilitaires et calculs
│   └── skillCalculations.ts  # Logique des compétences
├── examples/           # Tests et exemples
└── tests/              # Tests unitaires
```

### Ajouter une compétence
1. Mettre à jour `BASE_SKILLS` dans `src/models/Skills.ts`
2. Ajouter aux listes `skills` des classes concernées dans `src/data/classesNWN.json`
3. Ajouter les traductions si nécessaire

### Contribuer
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📈 Performances

- **Calculs optimisés** : ~0.1ms par calcul de compétences
- **Mémorisation** des résultats pour éviter les recalculs
- **Validation différée** pour une UX fluide
- **Lazy loading** des composants lourds

## 🐛 Dépannage

### Problèmes courants
- **"Classe non trouvée"** : Vérifier `classesNWN.json`
- **Points incorrects** : Contrôler Intelligence + bonus racial
- **Compétence grisée** : Vérifier formation/prérequis

### Debug
```javascript
localStorage.setItem('debug-skills', 'true')
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Remerciements

- Communauté Neverwinter Nights Solarune
- Contributeurs et testeurs
- Inspiration des règles D&D 3.0 officielles
    ...reactDom.configs.recommended.rules,
  },
})
```
