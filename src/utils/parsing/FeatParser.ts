import { ParsingUtils } from './ParsingUtils';

export interface FeatData {
  id: string;
  nom: string;
  type: string;
  conditionsCaractéristiques?: Record<string, number>;
  conditionsId?: string[];
  requisPour?: string[];
  fonctionnement: string;
  utilisation: string;
  description?: string;
}

export class FeatParser {
  /**
   * Parse un fichier texte de don NWN en objet FeatData
   */
  static parseFeat(content: string, filename: string): FeatData | null {
    try {
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) {
        console.warn(`Fichier vide: ${filename}`);
        return null;
      }

      // Extraction du nom et génération de l'ID
      const nom = this.extractFeatName(lines, filename);
      const id = this.generateId(nom);

      // Extraction des sections principales
      const type = this.extractFeatType(lines);
      const prerequisites = this.extractPrerequisites(lines);
      const fonctionnement = this.extractDescription(lines);
      const utilisation = this.extractUsage(lines);

      const feat: FeatData = {
        id,
        nom,
        type,
        fonctionnement,
        utilisation
      };

      // Ajout des conditions si présentes
      if (prerequisites.characteristics && Object.keys(prerequisites.characteristics).length > 0) {
        feat.conditionsCaractéristiques = prerequisites.characteristics;
      }

      if (prerequisites.feats && prerequisites.feats.length > 0) {
        feat.conditionsId = prerequisites.feats;
      }

      if (prerequisites.requiredFor && prerequisites.requiredFor.length > 0) {
        feat.requisPour = prerequisites.requiredFor;
      }

      return feat;
    } catch (error) {
      console.error(`Erreur lors du parsing du don ${filename}:`, error);
      return null;
    }
  }

  /**
   * Extrait le nom du don depuis le contenu
   */
  private static extractFeatName(lines: string[], filename: string): string {
    // Essayer de trouver le nom dans les premières lignes
    for (const line of lines.slice(0, 5)) {
      if (line && !line.toLowerCase().includes('feat') && !line.toLowerCase().includes('prerequisites')) {
        const cleaned = ParsingUtils.cleanText(line);
        if (cleaned.length > 2 && cleaned.length < 50) {
          return cleaned;
        }
      }
    }

    // Fallback sur le nom de fichier
    return filename.replace(/\.txt$/i, '').replace(/_/g, ' ');
  }

  /**
   * Génère un ID à partir du nom
   */
  private static generateId(nom: string): string {
    return nom
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Extrait le type du don
   */
  private static extractFeatType(lines: string[]): string {
    const typeKeywords = ['type', 'category', 'général', 'guerrier', 'métamagie', 'création'];
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (typeKeywords.some(keyword => lower.includes(keyword))) {
        // Nettoyer et extraire le type
        let type = line.replace(/^[^:]*:?\s*/i, '');
        type = ParsingUtils.cleanText(type);
        if (type) return type;
      }
    }

    return 'Général'; // Valeur par défaut
  }

  /**
   * Extrait les prérequis du don
   */
  private static extractPrerequisites(lines: string[]): {
    characteristics: Record<string, number>;
    feats: string[];
    requiredFor: string[];
  } {
    const result = {
      characteristics: {} as Record<string, number>,
      feats: [] as string[],
      requiredFor: [] as string[]
    };

    const prereqSection = ParsingUtils.extractSection(lines, ['prerequisites', 'prérequis', 'conditions']);
    if (prereqSection) {
      // Parser les caractéristiques (ex: "Dex 15+")
      const statMatches = prereqSection.match(/(?:str|dex|con|int|wis|cha|force|dextérité|constitution|intelligence|sagesse|charisme)\s*:?\s*(\d+)/gi);
      if (statMatches) {
        for (const match of statMatches) {
          const [stat, value] = match.split(/[:\s]+/);
          const normalizedStat = this.normalizeStat(stat);
          if (normalizedStat) {
            result.characteristics[normalizedStat] = parseInt(value);
          }
        }
      }

      // Parser les dons prérequis
      const featMatches = prereqSection.match(/(?:don|feat|talent)\s*:?\s*([^,;.]+)/gi);
      if (featMatches) {
        for (const match of featMatches) {
          const featName = match.replace(/^(?:don|feat|talent)\s*:?\s*/i, '').trim();
          if (featName && featName.length > 2) {
            result.feats.push(this.generateId(featName));
          }
        }
      }
    }

    return result;
  }

  /**
   * Normalise les noms de caractéristiques
   */
  private static normalizeStat(stat: string): string | null {
    const statMap: Record<string, string> = {
      'str': 'force',
      'strength': 'force',
      'force': 'force',
      'dex': 'dexterite',
      'dexterity': 'dexterite',
      'dextérité': 'dexterite',
      'con': 'constitution',
      'constitution': 'constitution',
      'int': 'intelligence',
      'intelligence': 'intelligence',
      'wis': 'sagesse',
      'wisdom': 'sagesse',
      'sagesse': 'sagesse',
      'cha': 'charisme',
      'charisma': 'charisme',
      'charisme': 'charisme'
    };

    return statMap[stat.toLowerCase()] || null;
  }

  /**
   * Extrait la description/fonctionnement du don
   */
  private static extractDescription(lines: string[]): string {
    const descSections = ['description', 'benefit', 'fonctionnement', 'effet', 'avantage'];
    
    for (const section of descSections) {
      const content = ParsingUtils.extractSection(lines, [section]);
      if (content) {
        return ParsingUtils.cleanText(content);
      }
    }

    // Fallback: prendre le contenu après les métadonnées
    const contentLines = lines.slice(5);
    
    if (contentLines.length > 0) {
      return ParsingUtils.cleanText(contentLines.join(' '));
    }

    return 'Description non disponible';
  }

  /**
   * Extrait l'utilisation du don
   */
  private static extractUsage(lines: string[]): string {
    const usageKeywords = ['usage', 'utilisation', 'activation', 'use'];
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (usageKeywords.some(keyword => lower.includes(keyword))) {
        let usage = line.replace(/^[^:]*:?\s*/i, '');
        usage = ParsingUtils.cleanText(usage);
        if (usage) return usage;
      }
    }

    // Valeurs par défaut selon le type apparent
    const content = lines.join(' ').toLowerCase();
    if (content.includes('automatique') || content.includes('passive')) {
      return 'Automatique';
    } else if (content.includes('action') || content.includes('activate')) {
      return 'Action';
    }

    return 'Automatique'; // Valeur par défaut
  }

  /**
   * Valide qu'un don parsé est complet
   */
  static validateFeat(feat: FeatData): boolean {
    return !!(
      feat.id &&
      feat.nom &&
      feat.type &&
      feat.fonctionnement &&
      feat.utilisation
    );
  }
}
