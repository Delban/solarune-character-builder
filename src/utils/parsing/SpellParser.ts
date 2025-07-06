import { ParsingUtils } from './ParsingUtils';

export interface SpellData {
  id: string;
  nom: string;
  type: string;
  niveaux: Record<string, number>;
  composantes: string[];
  tempsIncantation: string;
  portee: string;
  cible?: string;
  duree: string;
  fonctionnement: string;
  utilisation: string;
  ecole?: string;
  registre?: string;
  jetSauvegarde?: string;
  resistanceMagie?: string;
}

export class SpellParser {
  /**
   * Parse un fichier texte de sort NWN en objet SpellData
   */
  static parseSpell(content: string, filename: string): SpellData | null {
    try {
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) {
        console.warn(`Fichier vide: ${filename}`);
        return null;
      }

      // Extraction du nom et génération de l'ID
      const nom = this.extractSpellName(lines, filename);
      const id = this.generateId(nom);

      // Extraction des sections principales
      const type = this.extractSpellType(lines);
      const ecole = this.extractSchool(lines);
      const niveaux = this.extractLevels(lines);
      const composantes = this.extractComponents(lines);
      const tempsIncantation = this.extractCastingTime(lines);
      const portee = this.extractRange(lines);
      const cible = this.extractTarget(lines);
      const duree = this.extractDuration(lines);
      const jetSauvegarde = this.extractSavingThrow(lines);
      const resistanceMagie = this.extractSpellResistance(lines);
      const fonctionnement = this.extractDescription(lines);

      const spell: SpellData = {
        id,
        nom,
        type,
        niveaux,
        composantes,
        tempsIncantation,
        portee,
        duree,
        fonctionnement,
        utilisation: 'Doit être lancé'
      };

      // Ajout des propriétés optionnelles
      if (ecole) spell.ecole = ecole;
      if (cible) spell.cible = cible;
      if (jetSauvegarde) spell.jetSauvegarde = jetSauvegarde;
      if (resistanceMagie) spell.resistanceMagie = resistanceMagie;

      return spell;
    } catch (error) {
      console.error(`Erreur lors du parsing du sort ${filename}:`, error);
      return null;
    }
  }

  /**
   * Extrait le nom du sort depuis le contenu
   */
  private static extractSpellName(lines: string[], filename: string): string {
    // Essayer de trouver le nom dans les premières lignes
    for (const line of lines.slice(0, 5)) {
      if (line && !line.toLowerCase().includes('spell') && !line.toLowerCase().includes('level')) {
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
   * Extrait le type du sort
   */
  private static extractSpellType(lines: string[]): string {
    const typeSection = ParsingUtils.extractSection(lines, ['type', 'category']);
    if (typeSection) {
      return ParsingUtils.cleanText(typeSection);
    }
    return 'Sort'; // Valeur par défaut
  }

  /**
   * Extrait l'école de magie
   */
  private static extractSchool(lines: string[]): string | undefined {
    const schoolSection = ParsingUtils.extractSection(lines, ['school', 'école', 'ecole']);
    if (schoolSection) {
      return ParsingUtils.cleanText(schoolSection);
    }
    return undefined;
  }

  /**
   * Extrait les niveaux de sort par classe
   */
  private static extractLevels(lines: string[]): Record<string, number> {
    const levels: Record<string, number> = {};
    const levelSection = ParsingUtils.extractSection(lines, ['level', 'niveau', 'niveaux']);
    
    if (levelSection) {
      // Parser les patterns comme "Magicien 3, Prêtre 4"
      const classMatches = levelSection.match(/([A-Za-zÀ-ÿ\s]+)\s+(\d+)/g);
      if (classMatches) {
        for (const match of classMatches) {
          const parts = match.trim().split(/\s+/);
          const level = parseInt(parts[parts.length - 1]);
          const className = parts.slice(0, -1).join(' ');
          
          if (!isNaN(level) && className) {
            const normalizedClass = this.normalizeClassName(className);
            levels[normalizedClass] = level;
          }
        }
      }
    }

    // Si aucun niveau trouvé, essayer de détecter dans d'autres lignes
    if (Object.keys(levels).length === 0) {
      for (const line of lines) {
        const match = line.match(/(?:level|niveau|lvl)\s*:?\s*(\d+)/i);
        if (match) {
          levels['Magicien'] = parseInt(match[1]);
          break;
        }
      }
    }

    return levels;
  }

  /**
   * Normalise les noms de classes
   */
  private static normalizeClassName(className: string): string {
    const classMap: Record<string, string> = {
      'wizard': 'Magicien',
      'magicien': 'Magicien',
      'mage': 'Magicien',
      'sorcerer': 'Ensorceleur',
      'ensorceleur': 'Ensorceleur',
      'cleric': 'Prêtre',
      'pretre': 'Prêtre',
      'prêtre': 'Prêtre',
      'druid': 'Druide',
      'druide': 'Druide',
      'bard': 'Barde',
      'barde': 'Barde',
      'ranger': 'Rôdeur',
      'rodeur': 'Rôdeur',
      'rôdeur': 'Rôdeur',
      'paladin': 'Paladin'
    };

    const normalized = classMap[className.toLowerCase()];
    return normalized || className;
  }

  /**
   * Extrait les composantes du sort
   */
  private static extractComponents(lines: string[]): string[] {
    const compSection = ParsingUtils.extractSection(lines, ['components', 'composantes', 'comp']);
    if (compSection) {
      // Parser les composantes (V, G, M, F, FD, etc.)
      const components = compSection.match(/[VGMF]+|FD/g);
      if (components) {
        return components;
      }
      
      // Parser en français
      const frenchComps = [];
      if (compSection.toLowerCase().includes('verbal') || compSection.includes('V')) {
        frenchComps.push('V');
      }
      if (compSection.toLowerCase().includes('gestuel') || compSection.includes('G')) {
        frenchComps.push('G');
      }
      if (compSection.toLowerCase().includes('matériel') || compSection.includes('M')) {
        frenchComps.push('M');
      }
      if (compSection.toLowerCase().includes('focaliseur') || compSection.includes('F')) {
        frenchComps.push('F');
      }
      if (compSection.toLowerCase().includes('divin') || compSection.includes('FD')) {
        frenchComps.push('FD');
      }
      
      return frenchComps;
    }
    
    return ['V', 'G']; // Valeur par défaut
  }

  /**
   * Extrait le temps d'incantation
   */
  private static extractCastingTime(lines: string[]): string {
    const timeSection = ParsingUtils.extractSection(lines, ['casting time', 'temps d\'incantation', 'incantation']);
    if (timeSection) {
      return ParsingUtils.cleanText(timeSection);
    }
    return '1 action simple'; // Valeur par défaut
  }

  /**
   * Extrait la portée du sort
   */
  private static extractRange(lines: string[]): string {
    const rangeSection = ParsingUtils.extractSection(lines, ['range', 'portée', 'portee']);
    if (rangeSection) {
      return ParsingUtils.cleanText(rangeSection);
    }
    return 'Contact'; // Valeur par défaut
  }

  /**
   * Extrait la cible du sort
   */
  private static extractTarget(lines: string[]): string | undefined {
    const targetSection = ParsingUtils.extractSection(lines, ['target', 'cible', 'targets']);
    if (targetSection) {
      return ParsingUtils.cleanText(targetSection);
    }
    return undefined;
  }

  /**
   * Extrait la durée du sort
   */
  private static extractDuration(lines: string[]): string {
    const durationSection = ParsingUtils.extractSection(lines, ['duration', 'durée', 'duree']);
    if (durationSection) {
      return ParsingUtils.cleanText(durationSection);
    }
    return 'Instantané'; // Valeur par défaut
  }

  /**
   * Extrait le jet de sauvegarde
   */
  private static extractSavingThrow(lines: string[]): string | undefined {
    const saveSection = ParsingUtils.extractSection(lines, ['saving throw', 'jet de sauvegarde', 'sauvegarde']);
    if (saveSection) {
      return ParsingUtils.cleanText(saveSection);
    }
    return undefined;
  }

  /**
   * Extrait la résistance à la magie
   */
  private static extractSpellResistance(lines: string[]): string | undefined {
    const srSection = ParsingUtils.extractSection(lines, ['spell resistance', 'résistance', 'resistance']);
    if (srSection) {
      return ParsingUtils.cleanText(srSection);
    }
    return undefined;
  }

  /**
   * Extrait la description/fonctionnement du sort
   */
  private static extractDescription(lines: string[]): string {
    const descSections = ['description', 'effect', 'fonctionnement', 'effet'];
    
    for (const section of descSections) {
      const content = ParsingUtils.extractSection(lines, [section]);
      if (content) {
        return ParsingUtils.cleanText(content);
      }
    }

    // Fallback: prendre le contenu après les métadonnées
    const contentLines = lines.slice(8); // Skip plus de lignes pour les sorts
    
    if (contentLines.length > 0) {
      return ParsingUtils.cleanText(contentLines.join(' '));
    }

    return 'Description non disponible';
  }

  /**
   * Valide qu'un sort parsé est complet
   */
  static validateSpell(spell: SpellData): boolean {
    return !!(
      spell.id &&
      spell.nom &&
      spell.type &&
      spell.niveaux &&
      Object.keys(spell.niveaux).length > 0 &&
      spell.composantes &&
      spell.composantes.length > 0 &&
      spell.tempsIncantation &&
      spell.portee &&
      spell.duree &&
      spell.fonctionnement
    );
  }
}
