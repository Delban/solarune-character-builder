// src/examples/skillCalculationExamples.ts
// Exemples et tests manuels pour les calculs de compétences

import type { Character } from '../models/Character';
import { 
  calculateSkillPointsForLevel, 
  isSkillClassSkill 
} from '../utils/skillCalculations';

// Fonction utilitaire pour créer un personnage de test
function createTestCharacter(
  race: string, 
  className: string, 
  intelligence: number, 
  level: number = 1
): Character {
  return {
    id: `test-${race}-${className}`,
    nom: `Test ${className}`,
    race,
    attributsBase: {
      force: 10,
      dexterite: 14,
      constitution: 14,
      intelligence,
      sagesse: 12,
      charisme: 10
    },
    niveaux: [
      {
        niveau: 1,
        classe: className,
        pointsVieGagnes: 8,
        competencesAmeliorees: {},
        donsChoisis: [],
        pointsCompetencesNonDepenses: 0
      }
    ],
    niveauTotal: level,
    pointsVieTotal: 8,
    bonusAttaqueBase: 0,
    jetsSauvegardeFinaux: { vigueur: 0, reflexes: 2, volonte: 0 },
    competences: {},
    dateCreation: new Date(),
    derniereModification: new Date(),
    version: '1.0'
  };
}

// Fonction de test pour afficher les résultats
function runSkillTests() {
  console.log('=== Tests de Calcul des Compétences ===\n');

  // Test 1: Roublard Humain Int 16 niveau 1
  console.log('Test 1: Roublard Humain Intelligence 16, Niveau 1');
  const rogue = createTestCharacter('humain', 'rogue', 16, 1);
  
  try {
    const rogueSkills = calculateSkillPointsForLevel(rogue, 1);
    console.log('Résultats Roublard:');
    console.log(`- Points de base: ${rogueSkills.basePoints}`);
    console.log(`- Modificateur Int: ${rogueSkills.intModifier}`);
    console.log(`- Total points: ${rogueSkills.totalPoints}`);
    console.log(`- Premier niveau: ${rogueSkills.isFirstLevel}`);
    console.log(`- Attendu: (8 + 3 + 1) × 4 = 48 points`);
    console.log(`- Résultat: ${rogueSkills.totalPoints === 48 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
  } catch (error) {
    console.log(`❌ Erreur: ${error}\n`);
  }

  // Test 2: Sorcier Humain Int 14 niveau 1  
  console.log('Test 2: Sorcier Humain Intelligence 14, Niveau 1');
  const sorcerer = createTestCharacter('humain', 'sorcerer', 14, 1);
  
  try {
    const sorcererSkills = calculateSkillPointsForLevel(sorcerer, 1);
    console.log('Résultats Sorcier:');
    console.log(`- Points de base: ${sorcererSkills.basePoints}`);
    console.log(`- Modificateur Int: ${sorcererSkills.intModifier}`);
    console.log(`- Total points: ${sorcererSkills.totalPoints}`);
    console.log(`- Premier niveau: ${sorcererSkills.isFirstLevel}`);
    console.log(`- Attendu: (2 + 2 + 1) × 4 = 20 points`);
    console.log(`- Résultat: ${sorcererSkills.totalPoints === 20 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
  } catch (error) {
    console.log(`❌ Erreur: ${error}\n`);
  }

  // Test 3: Niveau 2 (pas de quadruple)
  console.log('Test 3: Roublard Humain Intelligence 16, Niveau 2');
  const rogue2 = createTestCharacter('humain', 'rogue', 16, 2);
  rogue2.niveaux.push({
    niveau: 2,
    classe: 'rogue',
    pointsVieGagnes: 8,
    competencesAmeliorees: {},
    donsChoisis: [],
    pointsCompetencesNonDepenses: 0
  });
  rogue2.niveauTotal = 2;
  
  try {
    const rogue2Skills = calculateSkillPointsForLevel(rogue2, 2);
    console.log('Résultats Roublard Niveau 2:');
    console.log(`- Points de base: ${rogue2Skills.basePoints}`);
    console.log(`- Modificateur Int: ${rogue2Skills.intModifier}`);
    console.log(`- Total points: ${rogue2Skills.totalPoints}`);
    console.log(`- Premier niveau: ${rogue2Skills.isFirstLevel}`);
    console.log(`- Attendu: 8 + 3 + 1 = 12 points (pas quadruplé)`);
    console.log(`- Résultat: ${rogue2Skills.totalPoints === 12 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
  } catch (error) {
    console.log(`❌ Erreur: ${error}\n`);
  }

  // Test 4: Intelligence très basse
  console.log('Test 4: Sorcier Intelligence 6 (minimum 1 point)');
  const lowIntSorcerer = createTestCharacter('humain', 'sorcerer', 6, 1);
  
  try {
    const lowIntSkills = calculateSkillPointsForLevel(lowIntSorcerer, 1);
    console.log('Résultats Sorcier Int Basse:');
    console.log(`- Points de base: ${lowIntSkills.basePoints}`);
    console.log(`- Modificateur Int: ${lowIntSkills.intModifier}`);
    console.log(`- Total points: ${lowIntSkills.totalPoints}`);
    console.log(`- Attendu: max(1, 2 - 2 + 1) × 4 = 8 points`);
    console.log(`- Résultat: ${lowIntSkills.totalPoints === 8 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
  } catch (error) {
    console.log(`❌ Erreur: ${error}\n`);
  }

  // Test 5: Compétences de classe
  console.log('Test 5: Compétences de classe');
  console.log('Roublard:');
  console.log(`- Discrétion (devrait être classe): ${isSkillClassSkill('discretion', 'rogue') ? '✅' : '❌'}`);
  console.log(`- Création armure (hors-classe): ${!isSkillClassSkill('creation_armure', 'rogue') ? '✅' : '❌'}`);
  
  console.log('Sorcier:');
  console.log(`- Bluff (devrait être classe): ${isSkillClassSkill('bluff', 'sorcerer') ? '✅' : '❌'}`);
  console.log(`- Discrétion (hors-classe): ${!isSkillClassSkill('discretion', 'sorcerer') ? '✅' : '❌'}`);

  console.log('\n=== Fin des Tests ===');
}

// Test de performance simple
function performanceTest() {
  console.log('\n=== Test de Performance ===');
  
  const character = createTestCharacter('humain', 'rogue', 16, 1);
  const start = performance.now();
  
  // Exécuter 1000 calculs
  for (let i = 0; i < 1000; i++) {
    calculateSkillPointsForLevel(character, 1);
  }
  
  const end = performance.now();
  console.log(`1000 calculs en ${(end - start).toFixed(2)}ms`);
  console.log(`Moyenne: ${((end - start) / 1000).toFixed(4)}ms par calcul`);
}

// Export pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).runSkillTests = runSkillTests;
  (window as any).performanceTest = performanceTest;
  (window as any).createTestCharacter = createTestCharacter;
  
  console.log('Tests de compétences chargés !');
  console.log('Utilisez runSkillTests() pour exécuter les tests');
  console.log('Utilisez performanceTest() pour le test de performance');
}

export { runSkillTests, performanceTest, createTestCharacter };
