jest.mock('../../database/prisma/prisma.service');
jest.mock('../../common/services/attribute-calculator.service');

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { SheetService } from './sheet.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttributeCalculatorService } from '../../common/services/attribute-calculator.service';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { CreateEffectDto } from './dto/create-effect.dto';

describe('SheetService', () => {
  let service: SheetService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tableMember: { findFirst: jest.fn(), findUnique: jest.fn() },
    sheetTemplate: { findFirst: jest.fn(), findUnique: jest.fn() },
    characterSheet: { 
      create: jest.fn(), 
      findUnique: jest.fn(), 
      findMany: jest.fn(), 
      update: jest.fn(), 
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    sheetAttribute: { findUnique: jest.fn(), update: jest.fn(), createMany: jest.fn() },
    sheetSkill: { findUnique: jest.fn(), update: jest.fn(), createMany: jest.fn() },
    sheetRaceTrait: { createMany: jest.fn(), deleteMany: jest.fn() },
    templateRaceDefinition: { findUnique: jest.fn() },
    sheetClass: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    sheetClassFeature: { createMany: jest.fn(), deleteMany: jest.fn() },
    templateClassDefinition: { findUnique: jest.fn() },
    sheetEffect: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    sheetCurrency: { findUnique: jest.fn(), update: jest.fn(), createMany: jest.fn() },
    sheetItem: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    sheetSessionState: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    sheetAttributeOverride: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    templateItemCategory: { findUnique: jest.fn() },
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: AttributeCalculatorService,
          useValue: {
            validateFormula: jest.fn(),
            evaluate: jest.fn(),
            extractVariables: jest.fn(),
            detectCycles: jest.fn(),
            getCached: jest.fn(),
            setCached: jest.fn(),
            invalidateCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SheetService>(SheetService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException if sheet not found', async () => {
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(null);

      await expect(service.findOne('table-1', 'sheet-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if sheet belongs to different table', async () => {
      const sheet = { 
        id: 'sheet-1',
        template: { tableId: 'table-2', attributeFormulas: [] },
        member: {},
      };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-2' });

      await expect(service.findOne('table-1', 'sheet-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAttributeValue', () => {
    it('should throw NotFoundException if attribute not found', async () => {
      const sheet = { 
        id: 'sheet-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: {},
      };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.sheetAttribute.findUnique.mockResolvedValue(null);

      const dto: UpdateAttributeValueDto = { value: '18' };
      await expect(service.updateAttributeValue('table-1', 'sheet-1', 'attr-1', dto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if attribute belongs to different sheet', async () => {
      const sheet = { 
        id: 'sheet-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: {},
      };
      const attr = { id: 'attr-1', sheetId: 'sheet-2' }; // Different sheet!
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.sheetAttribute.findUnique.mockResolvedValue(attr);

      const dto: UpdateAttributeValueDto = { value: '18' };
      await expect(service.updateAttributeValue('table-1', 'sheet-1', 'attr-1', dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createEffect', () => {
    it('should throw ForbiddenException if user does not own the sheet', async () => {
      const sheet = { 
        id: 'sheet-1',
        memberId: 'member-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-1' }, // Owner is user-1
      };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ userId: 'user-1' });

      const dto: CreateEffectDto = { name: 'Haste', type: 'BUFF' };
      
      // User-2 tries to create effect on sheet owned by user-1
      await expect(service.createEffect('table-1', 'sheet-1', 'user-2', dto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should create effect if user owns the sheet', async () => {
      const sheet = { 
        id: 'sheet-1',
        memberId: 'member-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-1' },
      };
      const effect = { id: 'effect-1', name: 'Haste', sheetId: 'sheet-1' };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.sheetEffect.create.mockResolvedValue(effect);

      const dto: CreateEffectDto = { name: 'Haste', type: 'BUFF' };
      const result = await service.createEffect('table-1', 'sheet-1', 'user-1', dto);

      expect(result.name).toBe('Haste');
      expect(mockPrismaService.sheetEffect.create).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if user not member', async () => {
      mockPrismaService.tableMember.findFirst.mockResolvedValue(null);

      const dto: CreateSheetDto = { name: 'Character' };
      await expect(service.create('table-1', 'user-1', dto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if template not found', async () => {
      const member = { id: 'member-1', tableId: 'table-1', userId: 'user-1' };
      
      mockPrismaService.tableMember.findFirst.mockResolvedValue(member);
      mockPrismaService.sheetTemplate.findFirst.mockResolvedValue(null);

      const dto: CreateSheetDto = { name: 'Character' };
      await expect(service.create('table-1', 'user-1', dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should throw BadRequestException if sheet not owned by user', async () => {
      const sheet = { 
        id: 'sheet-1',
        memberId: 'member-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-2' }, // Different user!
      };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ userId: 'user-2' });

      // User-1 tries to activate sheet owned by user-2
      await expect(service.activate('table-1', 'sheet-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if member already has active sheet', async () => {
      const sheet = { 
        id: 'sheet-1',
        memberId: 'member-1',
        status: 'DRAFT',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-1' },
      };
      const existingActive = { id: 'sheet-2', status: 'ACTIVE' };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ id: 'member-1', userId: 'user-1' });
      mockPrismaService.characterSheet.findFirst.mockResolvedValue(existingActive);

      await expect(service.activate('table-1', 'sheet-1', 'user-1'))
        .rejects.toThrow(ConflictException);
    });

    it('should activate sheet if no active sheet exists', async () => {
      const sheet = { 
        id: 'sheet-1',
        memberId: 'member-1',
        status: 'DRAFT',
        member: { userId: 'user-1', user: {}, tableRole: {} },
        template: { tableId: 'table-1', attributeFormulas: [] },
        attributes: [],
        skills: [],
        currencies: [],
        race: null,
        classes: [],
        items: [],
        effects: [],
        raceTraits: [],
        sessionStates: [],
        attributeOverrides: [],
      };
      const activated = { ...sheet, status: 'ACTIVE' };
      
      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ id: 'member-1', userId: 'user-1' });
      mockPrismaService.characterSheet.findFirst.mockResolvedValue(null);
      mockPrismaService.characterSheet.update.mockResolvedValue(activated);

      const result = await service.activate('table-1', 'sheet-1', 'user-1');

      expect(result.status).toBe('ACTIVE');
      expect(mockPrismaService.characterSheet.update).toHaveBeenCalled();
    });
  });

  describe('validation rules', () => {
    it('should throw ConflictException if trying to create duplicate effect', async () => {
      const sheet = {
        id: 'sheet-1',
        memberId: 'member-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-1' },
        effects: [{ name: 'Haste', isActive: true, expiresAt: null }],
      };

      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ userId: 'user-1' });

      const dto = { name: 'Haste', type: 'BUFF' } as any;

      await expect(service.createEffect('table-1', 'sheet-1', 'user-1', dto))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for effect expiration in the past', async () => {
      const sheet = {
        id: 'sheet-1',
        memberId: 'member-1',
        template: { tableId: 'table-1', attributeFormulas: [] },
        member: { userId: 'user-1' },
        effects: [],
      };

      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.tableMember.findUnique.mockResolvedValue({ userId: 'user-1' });

      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const dto = { name: 'Expired', type: 'BUFF', expiresAt: pastDate.toISOString() } as any;

      await expect(service.createEffect('table-1', 'sheet-1', 'user-1', dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid session state (both false)', async () => {
      const sheet = { id: 'sheet-1', template: { tableId: 'table-1', attributeFormulas: [] } };
      const sessionState = { id: 'state-1', isVisible: true, isInScene: true };

      mockPrismaService.characterSheet.findUnique.mockResolvedValue(sheet);
      mockPrismaService.sheetTemplate.findUnique.mockResolvedValue({ tableId: 'table-1' });
      mockPrismaService.sheetSessionState.findFirst.mockResolvedValue(sessionState);

      const dto = { isVisible: false, isInScene: false };

      await expect(service.updateSessionState('table-1', 'sheet-1', 'user-1', dto))
        .rejects.toThrow(BadRequestException);
    });
  });
});
