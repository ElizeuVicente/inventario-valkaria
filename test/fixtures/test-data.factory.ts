function generateUUID(): string {
  const hex = Math.random().toString(16).substring(2);
  return `${hex}-${hex}-${hex}-${hex}-${hex.substring(0, 12)}`;
}

export class TestDataFactory {
  static userId = (): string => generateUUID();
  static tableId = (): string => generateUUID();
  static sheetId = (): string => generateUUID();
  static raceId = (): string => generateUUID();
  static classId = (): string => generateUUID();
  static attributeId = (): string => generateUUID();
  static skillId = (): string => generateUUID();
  static currencyId = (): string => generateUUID();
  static itemId = (): string => generateUUID();
  static modifierId = (): string => generateUUID();
  static effectId = (): string => generateUUID();
  static memberId = (): string => generateUUID();
  static templateId = (): string => generateUUID();

  static user(overrides = {}) {
    return {
      id: this.userId(),
      email: `user-${Date.now()}@test.com`,
      name: 'Test User',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static table(overrides = {}) {
    return {
      id: this.tableId(),
      name: 'Test Table',
      description: 'Test Description',
      systemId: this.templateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static tableMember(overrides = {}) {
    return {
      id: this.memberId(),
      tableId: this.tableId(),
      userId: this.userId(),
      roleId: generateUUID(),
      joinedAt: new Date(),
      ...overrides,
    };
  }

  static sheetTemplate(overrides = {}) {
    return {
      id: this.templateId(),
      tableId: this.tableId(),
      systemId: this.templateId(),
      name: 'Default Template',
      description: 'Default Character Sheet Template',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static characterSheet(overrides = {}) {
    return {
      id: this.sheetId(),
      memberId: this.memberId(),
      templateId: this.templateId(),
      name: 'Test Character',
      description: 'Test Description',
      status: 'DRAFT',
      raceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static sheetAttribute(overrides = {}) {
    return {
      id: this.attributeId(),
      sheetId: this.sheetId(),
      definitionId: generateUUID(),
      value: '15',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static sheetSkill(overrides = {}) {
    return {
      id: this.skillId(),
      sheetId: this.sheetId(),
      definitionId: generateUUID(),
      value: 3,
      isProficient: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static sheetCurrency(overrides = {}) {
    return {
      id: this.currencyId(),
      sheetId: this.sheetId(),
      definitionId: generateUUID(),
      amount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static sheetItem(overrides = {}) {
    return {
      id: this.itemId(),
      sheetId: this.sheetId(),
      categoryId: generateUUID(),
      name: 'Test Item',
      description: 'Test Description',
      quantity: 1,
      weight: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static sheetEffect(overrides = {}) {
    return {
      id: this.effectId(),
      sheetId: this.sheetId(),
      name: 'Test Effect',
      type: 'BUFF',
      description: 'Test Description',
      expiresAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static race(overrides = {}) {
    return {
      id: this.raceId(),
      templateId: this.templateId(),
      name: 'Human',
      description: 'Test Race',
      createdAt: new Date(),
      updatedAt: new Date(),
      traits: [],
      ...overrides,
    };
  }

  static sheetClass(overrides = {}) {
    return {
      id: generateUUID(),
      sheetId: this.sheetId(),
      classId: this.classId(),
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static templateClassDefinition(overrides = {}) {
    return {
      id: this.classId(),
      templateId: this.templateId(),
      name: 'Fighter',
      description: 'Test Class',
      hitDice: 'd10',
      createdAt: new Date(),
      updatedAt: new Date(),
      features: [],
      ...overrides,
    };
  }

  static templateAttributeDefinition(overrides = {}) {
    return {
      id: generateUUID(),
      templateId: this.templateId(),
      name: 'DEX',
      label: 'Dexterity',
      description: 'Agility and coordination',
      type: 'NUMBER',
      defaultValue: '10',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static templateSkillDefinition(overrides = {}) {
    return {
      id: generateUUID(),
      templateId: this.templateId(),
      name: 'Acrobatics',
      description: 'Balance and coordination',
      attributeId: null,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static systemCurrencyDefinition(overrides = {}) {
    return {
      id: generateUUID(),
      systemId: this.templateId(),
      name: 'Gold',
      code: 'GP',
      symbol: 'gp',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
