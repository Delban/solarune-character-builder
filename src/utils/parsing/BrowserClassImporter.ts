import type { ClassNWN } from '../../models/ClassNWN';
import { ClassParser } from './ClassParser';

/**
 * Utilitaire pour importer des classes depuis les fichiers texte
 * Cette version est destinée à être utilisée manuellement dans le navigateur
 */
export class BrowserClassImporter {
  /**
   * Parse un seul fichier texte et retourne la classe
   */
  static parseClassFromText(content: string, filename: string): ClassNWN | null {
    return ClassParser.parseClassFile(content, filename);
  }

  /**
   * Vérifie si une classe existe déjà dans la liste
   */
  static classExists(classes: ClassNWN[], classId: string): boolean {
    return classes.some(c => c.id === classId);
  }

  /**
   * Ajoute une nouvelle classe à la liste si elle n'existe pas déjà
   */
  static addClassIfNotExists(classes: ClassNWN[], newClass: ClassNWN): boolean {
    if (this.classExists(classes, newClass.id)) {
      console.log(`⏭️  Classe "${newClass.id}" déjà présente, ignorée`);
      return false;
    }
    
    classes.push(newClass);
    console.log(`✅ Classe "${newClass.nom}" (${newClass.id}) ajoutée avec succès`);
    return true;
  }

  /**
   * Génère une liste des classes manquantes en comparant avec les fichiers disponibles
   */
  static generateMissingClassesList(existingClasses: ClassNWN[], availableFiles: string[]): string[] {
    const existingIds = new Set(existingClasses.map(c => c.id));
    return availableFiles
      .filter(file => file.endsWith('.txt'))
      .map(file => file.replace('.txt', '').toLowerCase())
      .filter(id => !existingIds.has(id));
  }

  /**
   * Affiche un rapport sur l'état des classes
   */
  static displayReport(existingClasses: ClassNWN[], availableFiles: string[]): void {
    const missing = this.generateMissingClassesList(existingClasses, availableFiles);
    const existing = existingClasses.map(c => c.id).sort();
    
    console.log('\n📋 Rapport des classes:');
    console.log(`   • ${existingClasses.length} classes dans la base de données`);
    console.log(`   • ${availableFiles.length} fichiers texte disponibles`);
    console.log(`   • ${missing.length} classes à importer`);
    
    if (missing.length > 0) {
      console.log('\n🆕 Classes à importer:');
      missing.forEach(id => console.log(`   • ${id}`));
    }
    
    console.log('\n✅ Classes déjà présentes:');
    existing.forEach(id => console.log(`   • ${id}`));
  }
}

// Helper pour créer une nouvelle liste de classes triée
export function sortClassesByName(classes: ClassNWN[]): ClassNWN[] {
  return [...classes].sort((a, b) => a.nom.localeCompare(b.nom));
}

// Helper pour exporter la liste en JSON formaté
export function exportClassesToJSON(classes: ClassNWN[]): string {
  return JSON.stringify(sortClassesByName(classes), null, 2);
}
