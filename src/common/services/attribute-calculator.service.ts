import { Injectable } from '@nestjs/common';
import { Parser } from 'expr-eval';

interface CachedAttributes {
  attributes: Map<string, string | number>;
  timestamp: number;
}

@Injectable()
export class AttributeCalculatorService {
  private cache = new Map<string, CachedAttributes>();
  private readonly CACHE_TTL = 60000; // 1 minute

  validateFormula(
    targetAttr: string,
    formula: string,
    allFormulas: Map<string, string>,
  ): void {
    try {
      new Parser().parse(formula);
    } catch {
      throw new Error(`Invalid formula syntax: ${formula}`);
    }

    const variables = this.extractVariables(formula);
    const visitedAttrs = new Set<string>();

    this.detectCycles(targetAttr, variables, allFormulas, visitedAttrs);
  }

  evaluate(
    formula: string,
    variables: Record<string, string | number>,
  ): number | string {
    try {
      const parser = new Parser();
      const expr = parser.parse(formula);

      const result = expr.evaluate(variables);

      if (typeof result === 'number') {
        return Math.round(result * 100) / 100;
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to evaluate formula: ${formula}. Error: ${error}`);
    }
  }

  extractVariables(formula: string): Set<string> {
    const variables = new Set<string>();
    const regex = /\b([A-Z_][A-Z0-9_]*)\b/gi;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const varName = match[1].toUpperCase();
      variables.add(varName);
    }

    return variables;
  }

  private detectCycles(
    targetAttr: string,
    dependsOn: Set<string>,
    allFormulas: Map<string, string>,
    visited: Set<string>,
    recursionStack: Set<string> = new Set(),
  ): void {
    if (recursionStack.has(targetAttr)) {
      throw new Error(
        `Circular dependency detected involving attribute: ${targetAttr}`,
      );
    }

    if (visited.has(targetAttr)) {
      return;
    }

    visited.add(targetAttr);
    recursionStack.add(targetAttr);

    for (const dep of dependsOn) {
      if (dep === targetAttr) {
        throw new Error(
          `Self-referential formula: ${targetAttr} depends on itself`,
        );
      }

      const depFormula = allFormulas.get(dep);
      if (depFormula) {
        const depVariables = this.extractVariables(depFormula);
        this.detectCycles(dep, depVariables, allFormulas, visited, recursionStack);
      }
    }

    recursionStack.delete(targetAttr);
  }

  getCached(sheetId: string): Map<string, string | number> | null {
    const cached = this.cache.get(sheetId);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(sheetId);
      return null;
    }

    return cached.attributes;
  }

  setCached(
    sheetId: string,
    attributes: Map<string, string | number>,
  ): void {
    this.cache.set(sheetId, {
      attributes,
      timestamp: Date.now(),
    });
  }

  invalidateCache(sheetId: string): void {
    this.cache.delete(sheetId);
  }

  calculateDependentAttributes(
    targetAttr: string,
    baseAttributes: Map<string, string | number>,
    formulas: Array<{ targetAttr: string; formula: string; priority: number }>,
  ): Map<string, string | number> {
    const result = new Map(baseAttributes);

    const sortedFormulas = formulas
      .filter((f) => f.targetAttr === targetAttr)
      .sort((a, b) => b.priority - a.priority);

    for (const formulaConfig of sortedFormulas) {
      const variables = this.extractVariables(formulaConfig.formula);
      const varValues: Record<string, string | number> = {};

      for (const varName of variables) {
        const val = result.get(varName.toUpperCase());
        if (val !== undefined) {
          varValues[varName] = val;
        }
      }

      const calculated = this.evaluate(formulaConfig.formula, varValues);
      result.set(targetAttr, calculated);
    }

    return result;
  }
}
