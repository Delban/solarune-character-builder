import { promises as fs } from 'fs';
import path from 'path';
import type { ClassNWN } from '../../models/ClassNWN';
import { ClassParser } from './ClassParser';

export class ClassImporter {
  private classesPath: string;
  private importPath: string;

  constructor(workspaceRoot: string) {
    this.classesPath = path.join(workspaceRoot, 'src', 'data', 'classesNWN.json');
    this.importPath = path.join(workspaceRoot, 'src', 'data', 'import', 'classes');
  }

  /**
   * Importe toutes les classes manquantes depuis les fichiers texte
   */
  async importMissingClasses(): Promise<{
    imported: string[];
    skipped: string[];
    errors: string[];
  }> {
    const result = {
      imported: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    try {
      // Charger les classes existantes
      const existingClasses = await this.loadExistingClasses();
      const existingIds = new Set(existingClasses.map(c => c.id));

      // Lister tous les fichiers texte dans le dossier d'import
      const files = await fs.readdir(this.importPath);
      const textFiles = files.filter(file => file.endsWith('.txt'));

      console.log(`🔍 Trouvé ${textFiles.length} fichiers texte à analyser`);
      console.log(`📚 ${existingClasses.length} classes déjà présentes dans la base`);

      const newClasses: ClassNWN[] = [];

      for (const file of textFiles) {
        try {
          const classId = file.replace('.txt', '').toLowerCase();
          
          // Vérifier si la classe existe déjà
          if (existingIds.has(classId)) {
            result.skipped.push(file);
            console.log(`⏭️  Classe "${classId}" déjà présente, ignorée`);
            continue;
          }

          // Lire et parser le fichier
          const filePath = path.join(this.importPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          const parsedClass = ClassParser.parseClassFile(content, file);
          
          if (parsedClass) {
            newClasses.push(parsedClass);
            result.imported.push(file);
            console.log(`✅ Classe "${parsedClass.nom}" (${parsedClass.id}) importée avec succès`);
          } else {
            result.errors.push(`Erreur lors du parsing de ${file}`);
            console.log(`❌ Erreur lors du parsing de ${file}`);
          }
        } catch (error) {
          const errorMsg = `Erreur lors du traitement de ${file}: ${error instanceof Error ? error.message : error}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Sauvegarder les nouvelles classes
      if (newClasses.length > 0) {
        await this.saveNewClasses(existingClasses, newClasses);
        console.log(`💾 ${newClasses.length} nouvelles classes ajoutées à la base de données`);
      } else {
        console.log(`ℹ️  Aucune nouvelle classe à importer`);
      }

      // Résumé
      console.log('\n📊 Résumé de l\'import:');
      console.log(`   • ${result.imported.length} classes importées`);
      console.log(`   • ${result.skipped.length} classes ignorées (déjà présentes)`);
      console.log(`   • ${result.errors.length} erreurs`);

      if (result.errors.length > 0) {
        console.log('\n❌ Erreurs rencontrées:');
        result.errors.forEach(error => console.log(`   • ${error}`));
      }

      return result;
    } catch (error) {
      const errorMsg = `Erreur générale lors de l'import: ${error instanceof Error ? error.message : error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      return result;
    }
  }

  /**
   * Charge les classes existantes depuis le fichier JSON
   */
  private async loadExistingClasses(): Promise<ClassNWN[]> {
    try {
      const content = await fs.readFile(this.classesPath, 'utf-8');
      return JSON.parse(content) as ClassNWN[];
    } catch (error) {
      console.warn(`⚠️  Impossible de charger les classes existantes: ${error instanceof Error ? error.message : error}`);
      return [];
    }
  }

  /**
   * Sauvegarde les classes mises à jour dans le fichier JSON
   */
  private async saveNewClasses(existingClasses: ClassNWN[], newClasses: ClassNWN[]): Promise<void> {
    const allClasses = [...existingClasses, ...newClasses];
    
    // Trier par nom pour maintenir un ordre cohérent
    allClasses.sort((a, b) => a.nom.localeCompare(b.nom));
    
    const jsonContent = JSON.stringify(allClasses, null, 2);
    await fs.writeFile(this.classesPath, jsonContent, 'utf-8');
  }

  /**
   * Affiche un rapport sur les classes disponibles
   */
  async generateReport(): Promise<void> {
    try {
      const existingClasses = await this.loadExistingClasses();
      const files = await fs.readdir(this.importPath);
      const textFiles = files.filter(file => file.endsWith('.txt'));
      
      const existingIds = new Set(existingClasses.map(c => c.id));
      const availableIds = textFiles.map(file => file.replace('.txt', '').toLowerCase());
      
      const missing = availableIds.filter(id => !existingIds.has(id));
      const present = availableIds.filter(id => existingIds.has(id));
      
      console.log('\n📋 Rapport des classes:');
      console.log(`   • ${existingClasses.length} classes dans la base de données`);
      console.log(`   • ${textFiles.length} fichiers texte disponibles`);
      console.log(`   • ${missing.length} classes à importer`);
      console.log(`   • ${present.length} classes déjà présentes`);
      
      if (missing.length > 0) {
        console.log('\n🆕 Classes à importer:');
        missing.forEach(id => console.log(`   • ${id}`));
      }
      
      if (present.length > 0) {
        console.log('\n✅ Classes déjà présentes:');
        present.forEach(id => console.log(`   • ${id}`));
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la génération du rapport: ${error instanceof Error ? error.message : error}`);
    }
  }
}
