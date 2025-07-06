import type { ClassNWN } from '../../models/ClassNWN';
import { ParsingUtils } from './ParsingUtils';

export class ClassParser {
  /**
   * Parse un fichier texte de classe NWN et retourne un objet ClassNWN
   */
  static parseClassFile(content: string, filename: string): ClassNWN | null {
    try {
      // Extraire le nom de la classe à partir du nom de fichier
      const className = filename.replace('.txt', '').replace(/_/g, ' ');
      const classId = filename.replace('.txt', '').toLowerCase();
      
      // Déterminer le type de classe
      const isPrestigeClass = content.toLowerCase().includes('prestige class') || 
                             content.toLowerCase().includes('(prestige class)');
      const type = isPrestigeClass ? 'prestige' : 'base';
      
      // Extraire la description
      const description = this.extractDescription(content);
      
      // Extraire le hit die
      const hitDie = this.extractHitDie(content);
      
      // Extraire les skill points
      const skillPoints = this.extractSkillPoints(content);
      
      // Extraire les proficiencies
      const proficiencies = this.extractProficiencies(content);
      
      // Extraire les skills
      const skills = this.extractSkills(content);
      
      // Extraire les primary saves
      const primarySaves = this.extractPrimarySaves(content);
      
      // Extraire BAB
      const baseAttackBonus = this.extractBaseAttackBonus(content);
      
      // Extraire les requirements
      const requirements = this.extractRequirements(content);
      
      // Extraire les unavailable feats
      const unavailableFeats = this.extractUnavailableFeats(content);
      
      // Construire l'objet classe
      const classObj: ClassNWN = {
        id: classId,
        nom: className,
        description,
        type,
        hit_die: hitDie,
        skill_points: skillPoints,
        skill_modifier: 'int', // Par défaut, pourrait être extrait du texte
        proficiencies,
        skills,
        primary_saves: primarySaves,
        base_attack_bonus: baseAttackBonus as 'full' | 'medium' | 'low',
        spellcasting: null, // À implémenter si nécessaire
        alignment_restriction: this.extractAlignmentRestriction(content),
        requirements,
        unavailable_feats: unavailableFeats,
        progression: [] // À implémenter si nécessaire
      };
      
      return classObj;
    } catch (error) {
      console.error(`Erreur lors du parsing de la classe ${filename}:`, error);
      return null;
    }
  }
  
  private static extractDescription(content: string): string {
    const lines = content.split('\n');
    let description = '';
    let foundDescription = false;
    
    for (const line of lines) {
      const cleanLine = line.trim();
      
      // Chercher la ligne Description
      if (cleanLine.includes("'''Description'''") || cleanLine.includes("Description:")) {
        foundDescription = true;
        continue;
      }
      
      if (foundDescription) {
        // Arrêter à la première ligne qui commence par '''
        if (cleanLine.startsWith("'''") && !cleanLine.includes("Description")) {
          break;
        }
        
        // Nettoyer la ligne des balises wiki
        const cleanedLine = ParsingUtils.cleanWikiText(cleanLine);
        if (cleanedLine.length > 0) {
          description += cleanedLine + ' ';
        }
      }
    }
    
    return description.trim();
  }
  
  private static extractHitDie(content: string): string {
    const hitDieMatch = content.match(/\[\[Hit die\]\]:\s*'''([^']+)'''/i) ||
                       content.match(/Hit die:\s*([d\d]+)/i);
    return hitDieMatch ? hitDieMatch[1].trim() : 'd8';
  }
  
  private static extractSkillPoints(content: string): number {
    const skillPointsMatch = content.match(/\[\[Skill point\]\]s:\s*'''(\d+)/i) ||
                            content.match(/Skill points:\s*(\d+)/i);
    return skillPointsMatch ? parseInt(skillPointsMatch[1]) : 2;
  }
  
  private static extractProficiencies(content: string): any {
    const proficiencies = {
      weapons: [] as string[],
      armor: [] as string[],
      shields: false
    };
    
    // Chercher la section proficiencies
    const profMatch = content.match(/'''Proficiencies:'''([^']*?)(?='''|$)/i);
    if (profMatch) {
      const profText = profMatch[1].toLowerCase();
      
      // Weapons
      if (profText.includes('simple')) proficiencies.weapons.push('simple');
      if (profText.includes('martial')) proficiencies.weapons.push('martial');
      if (profText.includes('exotic')) proficiencies.weapons.push('exotic');
      
      // Armor
      if (profText.includes('light')) proficiencies.armor.push('light');
      if (profText.includes('medium')) proficiencies.armor.push('medium');
      if (profText.includes('heavy')) proficiencies.armor.push('heavy');
      if (profText.includes('all') && profText.includes('armor')) {
        proficiencies.armor = ['light', 'medium', 'heavy'];
      }
      
      // Shields
      proficiencies.shields = profText.includes('shield');
    }
    
    return proficiencies;
  }
  
  private static extractSkills(content: string): string[] {
    const skillsMatch = content.match(/'''Skills:'''([^']*?)(?='''|$)/i);
    if (!skillsMatch) return [];
    
    const skillsText = skillsMatch[1];
    const skills = ParsingUtils.extractList(skillsText.replace(/,/g, '\n'));
    
    return skills.map(skill => {
      // Nettoyer et convertir en format snake_case
      return ParsingUtils.cleanWikiText(skill)
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[()]/g, '');
    });
  }
  
  private static extractPrimarySaves(content: string): string[] {
    const savesMatch = content.match(/'''Primary saving throw\(s\):'''([^']*?)(?='''|$)/i) ||
                      content.match(/Primary saving throw.*?:([^']*?)(?='''|$)/i);
    
    if (!savesMatch) return [];
    
    const savesText = savesMatch[1].toLowerCase();
    const saves: string[] = [];
    
    if (savesText.includes('fortitude')) saves.push('fortitude');
    if (savesText.includes('reflex')) saves.push('reflex');
    if (savesText.includes('will')) saves.push('will');
    
    return saves;
  }
  
  private static extractBaseAttackBonus(content: string): string {
    const babMatch = content.match(/'''Base attack bonus:'''([^']*?)(?='''|$)/i) ||
                    content.match(/Base attack bonus.*?:([^']*?)(?='''|$)/i);
    
    if (!babMatch) return 'medium';
    
    const babText = babMatch[1].toLowerCase();
    
    if (babText.includes('+1/level') || babText.includes('full')) return 'full';
    if (babText.includes('3/4') || babText.includes('medium')) return 'medium';
    if (babText.includes('1/2') || babText.includes('low')) return 'low';
    
    return 'medium';
  }
  
  private static extractRequirements(content: string): any {
    const requirements: any = {};
    
    // Chercher la section Requirements
    const reqMatch = content.match(/==\s*Requirements\s*==([^=]*?)(?==|$)/i);
    if (!reqMatch) return requirements;
    
    const reqText = reqMatch[1];
    
    // Base Attack Bonus
    const babMatch = reqText.match(/Base attack bonus.*?[:\+]\s*[+]?(\d+)/i);
    if (babMatch) {
      requirements.base_attack_bonus = parseInt(babMatch[1]);
    }
    
    // Skills
    const skillMatch = reqText.match(/Skills.*?:\s*([^']*?)(?='''|Feats|Alignment|$)/i);
    if (skillMatch) {
      const skillReqs = skillMatch[1];
      const skillsWithRanks = skillReqs.match(/\[\[([^\]]+)\]\]\s*(\d+)/g);
      if (skillsWithRanks) {
        requirements.skills = {};
        skillsWithRanks.forEach(skill => {
          const match = skill.match(/\[\[([^\]]+)\]\]\s*(\d+)/);
          if (match) {
            const skillName = match[1].toLowerCase().replace(/\s+/g, '_');
            requirements.skills[skillName] = parseInt(match[2]);
          }
        });
      }
    }
    
    // Feats
    const featMatch = reqText.match(/Feats.*?:\s*([^']*?)(?='''|Skills|Alignment|$)/i);
    if (featMatch) {
      const feats = ParsingUtils.extractList(featMatch[1].replace(/,/g, '\n'));
      requirements.feats = feats.map(feat => 
        ParsingUtils.cleanWikiText(feat).toLowerCase().replace(/\s+/g, '_')
      );
    }
    
    // Alignment
    const alignMatch = reqText.match(/Alignment.*?:\s*([^']*?)(?='''|Skills|Feats|$)/i);
    if (alignMatch) {
      requirements.alignment = ParsingUtils.cleanWikiText(alignMatch[1]).toLowerCase();
    }
    
    return requirements;
  }
  
  private static extractAlignmentRestriction(content: string): string | null {
    const reqMatch = content.match(/==\s*Requirements\s*==([^=]*?)(?==|$)/i);
    if (!reqMatch) return null;
    
    const alignMatch = reqMatch[1].match(/Alignment.*?:\s*([^']*?)(?='''|Skills|Feats|$)/i);
    if (alignMatch) {
      return ParsingUtils.cleanWikiText(alignMatch[1]).toLowerCase();
    }
    
    return null;
  }
  
  private static extractUnavailableFeats(content: string): string[] {
    const unavailableMatch = content.match(/'''Unavailable feats:'''([^']*?)(?='''|$)/i);
    if (!unavailableMatch) return [];
    
    const featsText = unavailableMatch[1];
    const feats = ParsingUtils.extractList(featsText.replace(/,/g, '\n'));
    
    return feats.map(feat => 
      ParsingUtils.cleanWikiText(feat).toLowerCase().replace(/\s+/g, '_')
    );
  }
}
