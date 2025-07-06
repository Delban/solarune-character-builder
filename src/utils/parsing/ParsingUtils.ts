/**
 * Interface pour les parsers de données NWN
 */
export interface DataParser<T> {
  parse(content: string, filename?: string): T[];
  validate(data: T): boolean;
}

/**
 * Résultat d'un parsing avec métadonnées
 */
export interface ParseResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
  filename?: string;
  timestamp: Date;
}

/**
 * Configuration du parsing
 */
export interface ParseConfig {
  strictMode?: boolean;
  skipValidation?: boolean;
  customPatterns?: Record<string, RegExp>;
}

/**
 * Utilitaires de parsing communs
 */
export class ParsingUtils {
  /**
   * Nettoie le texte en supprimant les caractères indésirables
   */
  static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Nettoie le texte wiki en supprimant les balises et liens
   */
  static cleanWikiText(text: string): string {
    return text
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Liens wiki [[texte]]
      .replace(/'''([^']+)'''/g, '$1')    // Texte en gras '''texte'''
      .replace(/''([^']+)''/g, '$1')      // Texte en italique ''texte''
      .replace(/<[^>]+>/g, '')            // Balises HTML
      .replace(/\{\{[^}]+\}\}/g, '')      // Templates {{template}}
      .replace(/\s+/g, ' ')               // Espaces multiples
      .trim();
  }

  /**
   * Extrait une valeur numérique d'un texte
   */
  static extractNumber(text: string, defaultValue: number = 0): number {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : defaultValue;
  }

  /**
   * Extrait une liste d'éléments séparés par des virgules
   */
  static extractList(text: string): string[] {
    return text
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Analyse les prérequis à partir d'un texte
   */
  static parsePrerequisites(text: string): Record<string, any> {
    const prerequisites: Record<string, any> = {};
    
    // Attributs (Force 13, Dextérité 15, etc.)
    const attributeMatch = text.match(/(?:Force|Strength|Str)\s+(\d+)/i);
    if (attributeMatch) {
      prerequisites.strength = parseInt(attributeMatch[1], 10);
    }

    const dexMatch = text.match(/(?:Dextérité|Dexterity|Dex)\s+(\d+)/i);
    if (dexMatch) {
      prerequisites.dexterity = parseInt(dexMatch[1], 10);
    }

    const conMatch = text.match(/(?:Constitution|Con)\s+(\d+)/i);
    if (conMatch) {
      prerequisites.constitution = parseInt(conMatch[1], 10);
    }

    const intMatch = text.match(/(?:Intelligence|Int)\s+(\d+)/i);
    if (intMatch) {
      prerequisites.intelligence = parseInt(intMatch[1], 10);
    }

    const wisMatch = text.match(/(?:Sagesse|Wisdom|Wis)\s+(\d+)/i);
    if (wisMatch) {
      prerequisites.wisdom = parseInt(wisMatch[1], 10);
    }

    const chaMatch = text.match(/(?:Charisme|Charisma|Cha)\s+(\d+)/i);
    if (chaMatch) {
      prerequisites.charisma = parseInt(chaMatch[1], 10);
    }

    // BAB
    const babMatch = text.match(/(?:BAB|Bonus d'attaque de base|Base Attack Bonus)\s*[+]?(\d+)/i);
    if (babMatch) {
      prerequisites.baseAttackBonus = parseInt(babMatch[1], 10);
    }

    // Dons prérequis
    const featMatch = text.match(/(?:Don|Feat)(?:s?):\s*([^.]+)/i);
    if (featMatch) {
      prerequisites.feats = this.extractList(featMatch[1]);
    }

    return prerequisites;
  }

  /**
   * Convertit un texte de dé de vie en nombre
   */
  static parseHitDie(text: string): number {
    const match = text.match(/d(\d+)/i);
    return match ? parseInt(match[1], 10) : 8;
  }

  /**
   * Analyse la progression du BAB
   */
  static parseBABProgression(text: string): 'full' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('forte') || lowerText.includes('full') || lowerText.includes('élevée')) {
      return 'full';
    } else if (lowerText.includes('moyenne') || lowerText.includes('medium') || lowerText.includes('modérée')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Analyse la progression des jets de sauvegarde
   */
  static parseSaveProgression(text: string): 'good' | 'poor' {
    const lowerText = text.toLowerCase();
    return (lowerText.includes('fort') || lowerText.includes('good') || lowerText.includes('élevé')) ? 'good' : 'poor';
  }

  /**
   * Extrait une section spécifique d'un texte basé sur des mots-clés
   */
  static extractSection(lines: string[], keywords: string[]): string | null {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Chercher une ligne qui contient un des mots-clés
      if (keywords.some(keyword => line.includes(keyword.toLowerCase()))) {
        // Collecter les lignes suivantes jusqu'à la prochaine section ou fin
        let sectionLines = [];
        let currentLine = line.includes(':') ? line.split(':')[1].trim() : '';
        
        if (currentLine) {
          sectionLines.push(currentLine);
        }
        
        // Continuer à lire les lignes suivantes
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          
          // Arrêter si on trouve une nouvelle section (ligne avec :)
          if (nextLine.includes(':') && this.looksLikeSection(nextLine)) {
            break;
          }
          
          sectionLines.push(nextLine);
        }
        
        const result = sectionLines.join(' ').trim();
        return result || null;
      }
    }
    
    return null;
  }

  /**
   * Vérifie si une ligne ressemble à un en-tête de section
   */
  private static looksLikeSection(line: string): boolean {
    const sectionKeywords = [
      'type', 'category', 'prerequisites', 'prérequis', 'description', 
      'benefit', 'effet', 'avantage', 'usage', 'utilisation', 'school',
      'école', 'level', 'niveau', 'components', 'composantes', 'range',
      'portée', 'duration', 'durée', 'saving throw', 'jet de sauvegarde'
    ];
    
    const lowerLine = line.toLowerCase();
    return sectionKeywords.some(keyword => lowerLine.includes(keyword));
  }

  /**
   * Extrait une valeur clé-valeur d'une ligne (ex: "Nom: Valeur")
   */
  static extractKeyValue(line: string, key: string): string | null {
    const regex = new RegExp(`${key}\\s*:?\\s*(.+)`, 'i');
    const match = line.match(regex);
    return match ? match[1].trim() : null;
  }
}

/**
 * Gestionnaire d'erreurs de parsing
 */
export class ParseError extends Error {
  public line?: number;
  public column?: number;
  public filename?: string;

  constructor(
    message: string,
    line?: number,
    column?: number,
    filename?: string
  ) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
    this.filename = filename;
  }
}
