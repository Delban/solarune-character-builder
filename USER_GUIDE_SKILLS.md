# Guide Utilisateur - Gestion des Compétences

## Comment gérer les compétences de votre personnage

### 1. Accès aux compétences

Dans le Character Builder, cliquez sur l'onglet **"Compétences"** pour accéder à la gestion des compétences de votre personnage.

### 2. Vue d'ensemble

L'écran des compétences vous montre :

- **Niveaux en attente** : Les niveaux qui ont encore des points de compétences non répartis (boutons jaunes)
- **Niveaux complétés** : Les niveaux où tous les points ont été assignés (boutons verts)
- **Résumé des compétences** : Vue d'ensemble de toutes vos compétences acquises

### 3. Répartir les points à un niveau

#### Cliquez sur un niveau
Cliquez sur le bouton d'un niveau pour ouvrir l'interface de répartition des compétences.

#### Interface de répartition

**Informations affichées :**
- Points disponibles pour ce niveau
- Points déjà dépensés  
- Points restants
- Votre modificateur d'Intelligence

**Pour chaque compétence :**
- **Nom** et **attribut principal**
- **Rangs actuels** et **maximum possible**
- **Indicateurs** :
  - 🟢 **Classe** : Compétence de classe (coût : 1 pt/rang)
  - 🔴 **Hors-classe** : Compétence hors-classe (coût : 2 pts/rang)
  - 📚 **Formation** : Nécessite une formation pour être utilisée
  - 🛡️ **Armure** : Malus d'armure appliqué
- **Modificateur total** : Rangs + modificateur d'attribut

#### Ajuster les rangs

- **Bouton +** : Ajouter un rang (si possible)
- **Bouton -** : Retirer un rang
- Les boutons sont désactivés si :
  - Vous n'avez plus assez de points
  - Vous atteignez le maximum de rangs
  - Vous tentez de descendre en-dessous de 0

### 4. Règles importantes

#### Points de compétences

**Niveau 1 :** Vous recevez **4 fois** plus de points
- Exemple : Roublard (8 pts) + Int 16 (+3) + Humain (+1) = 48 points au niveau 1

**Niveaux suivants :** Points normaux
- Même exemple au niveau 2 : 8 + 3 + 1 = 12 points

#### Coûts des rangs

- **Compétence de classe** : 1 point par rang
- **Compétence hors-classe** : 2 points par rang

#### Limites de rangs

- **Compétence de classe** : Maximum = Niveau + 3
- **Compétence hors-classe** : Maximum = (Niveau + 3) ÷ 2 (arrondi vers le bas)

### 5. Validation et sauvegarde

#### Validation automatique

L'interface vous prévient si :
- ❌ Vous dépassez vos points disponibles (texte rouge)
- ⚠️ Vous approchez de la limite
- ✅ Tout est correct (texte vert)

#### Sauvegarder vos choix

1. Cliquez **"Valider"** pour confirmer vos choix
2. Vous pouvez cliquer **"Réinitialiser"** pour annuler les modifications
3. Les points non dépensés sont conservés pour plus tard

### 6. Exemples pratiques

#### Roublard niveau 1 (Humain, Int 16)

**Points disponibles :** 48
**Compétences recommandées :**
- Discrétion : 4 rangs (classe) = 4 points
- Crochetage : 4 rangs (classe) = 4 points  
- Fouille : 4 rangs (classe) = 4 points
- Acrobaties : 4 rangs (classe) = 4 points
- **Total :** 16 points, reste 32 points

#### Sorcier niveau 1 (Humain, Int 14)

**Points disponibles :** 20
**Compétences recommandées :**
- Concentration : 4 rangs (classe) = 4 points
- Savoir : 4 rangs (classe) = 4 points
- Bluff : 4 rangs (classe) = 4 points
- **Total :** 12 points, reste 8 points

### 7. Conseils stratégiques

#### Priorités niveau 1
- Maximisez vos compétences de classe importantes
- Les points quadruplés ne reviennent plus !
- Gardez quelques points pour l'imprévu

#### Compétences de classe vs hors-classe
- Privilégiez toujours les compétences de classe (coût moitié)
- Les compétences hors-classe sont très chères
- Planifiez votre multiclassage en conséquence

#### Gestion des points
- Vous pouvez laisser des points non dépensés
- Ils seront disponibles pour les niveaux suivants
- Utile pour attendre une nouvelle classe

### 8. Dépannage

#### "Impossible d'ajouter un rang"
- Vérifiez vos points restants
- Contrôlez le plafond de rangs
- Pour les compétences "Formation", vérifiez que c'est une compétence de classe

#### "Points incorrects"
- Le calcul inclut : classe + Intelligence + racial
- Niveau 1 = × 4, niveaux suivants = normal
- Minimum 1 point même avec Intelligence très basse

#### "Compétence grisée"
- Peut nécessiter une formation
- Peut être limitée par votre classe
- Vérifiez les prérequis

---

Pour toute question, consultez la documentation développeur ou l'aide en ligne du Character Builder.
