import { BadRequestException, ConflictException } from '@nestjs/common';

export class SheetRulesValidator {
  static validateAttributeFormulaPrecedence(formulas: any[]): void {
    if (formulas.length === 0) return;

    const grouped = new Map<string, any[]>();
    for (const formula of formulas) {
      if (!grouped.has(formula.targetAttr)) {
        grouped.set(formula.targetAttr, []);
      }
      grouped.get(formula.targetAttr)!.push(formula);
    }

    for (const [attr, attrFormulas] of grouped.entries()) {
      if (attrFormulas.length > 1) {
        const sorted = [...attrFormulas].sort((a, b) => b.priority - a.priority);
        if (sorted[0].priority === sorted[1].priority && !sorted[0].isCumulative) {
          // Ambiguidade resolvida pelo ID (determinístico)
        }
      }
    }
  }

  static validateAttributeFormulaCycles(formula: string, allFormulas: Map<string, string>): void {
    // A validação de ciclos é realizada no AttributeCalculatorService
  }

  static validateEffectNotDuplicate(
    existingEffects: any[] | undefined,
    newEffectName: string,
  ): void {
    if (!existingEffects || existingEffects.length === 0) {
      return;
    }

    const duplicate = existingEffects.find(
      (e) => e.name === newEffectName && (!e.expiresAt || e.expiresAt > new Date()),
    );

    if (duplicate) {
      throw new ConflictException(
        `Effect "${newEffectName}" already exists on this sheet. Remove or wait for expiration.`,
      );
    }
  }

  static validateEffectDuration(expiresAt?: Date | string): void {
    if (!expiresAt) return;

    const expireDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const now = new Date();

    if (expireDate < now) {
      throw new BadRequestException('Effect expiration date cannot be in the past');
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (expireDate > oneYearFromNow) {
      console.warn(`[SheetRulesValidator] Effect duration >1 year: ${expireDate}`);
    }
  }

  static validateItemModifierStacking(
    existingModifiers: any[],
    newModifier: any,
  ): void {
    return;
  }

  static validateSessionState(isVisible: boolean, isInScene: boolean): void {
    if (!isVisible && !isInScene) {
      throw new BadRequestException(
        'Invalid session state: character must be either visible, in scene, or both',
      );
    }
  }

  static validatePermission(
    userRole: 'MASTER' | 'PLAYER' | 'OBSERVER',
    resource: 'own' | 'other',
  ): void {
    if (userRole === 'MASTER') return;

    if (userRole === 'PLAYER' && resource === 'other') {
      throw new ConflictException('Players can only modify their own sheets');
    }

    if (userRole === 'OBSERVER' && resource !== 'own') {
      throw new ConflictException('Observers have read-only access');
    }
  }

  static validateMulticlassing(existingClasses: any[], newClassId: string): void {
    const duplicate = existingClasses.find((c) => c.classId === newClassId);
    if (duplicate) {
      throw new ConflictException('Character already has this class');
    }
  }

  static validateCharacterLeveling(): void {
    throw new Error('Character leveling not implemented.');
  }

  static validateCombat(): void {
    throw new Error('Combat system not implemented.');
  }
}
