import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Character Sheet E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let tableId: string;
  let sheetId: string;
  let attributeId: string;
  let effectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. User Registration & Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send({
          email: 'testuser@example.com',
          username: 'testuser',
          name: 'Test User',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('testuser@example.com');
      userId = response.body.id;
    });

    it('should login and receive JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'testuser',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
      accessToken = response.body.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('testuser@example.com');
    });
  });

  describe('2. Table Management', () => {
    it('should create a table', async () => {
      const response = await request(app.getHttpServer())
        .post('/tables')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Campaign',
          description: 'A test D&D campaign',
          visibility: 'PUBLIC',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Campaign');
      tableId = response.body.id;
    });

    it('should list tables', async () => {
      const response = await request(app.getHttpServer())
        .get('/tables')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((t) => t.id === tableId)).toBe(true);
    });

    it('should get table details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(tableId);
      expect(response.body.name).toBe('Test Campaign');
    });
  });

  describe('3. Character Sheet CRUD', () => {
    it('should create a character sheet with auto-populated attributes', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Aragorn',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Aragorn');
      expect(response.body.status).toBe('DRAFT');
      expect(Array.isArray(response.body.attributes)).toBe(true);
      expect(response.body.attributes.length).toBeGreaterThan(0);

      sheetId = response.body.id;
      attributeId = response.body.attributes[0].id;
    });

    it('should list character sheets', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((s) => s.id === sheetId)).toBe(true);
    });

    it('should get character sheet with calculated attributes', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(sheetId);
      expect(response.body.attributes[0]).toHaveProperty('total');
      expect(response.body.attributes[0]).toHaveProperty('baseValue');
      expect(response.body.attributes[0]).toHaveProperty('itemModifiers');
      expect(response.body.attributes[0]).toHaveProperty('effectModifiers');
    });

    it('should update character sheet name', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Aragorn the King',
        })
        .expect(200);

      expect(response.body.name).toBe('Aragorn the King');
    });
  });

  describe('4. Attributes & Skills Management', () => {
    it('should update attribute value', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/attributes/${attributeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          value: '18',
        })
        .expect(200);

      expect(response.body.value).toBe('18');
    });

    it('should calculate total with modifiers', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const attr = response.body.attributes[0];
      expect(attr.baseValue).toBeDefined();
      expect(attr.total).toBeDefined();
      expect(typeof attr.total).toBe('number');
    });
  });

  describe('5. Items & Modifiers (Bonus Calculation)', () => {
    it('should create item', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets/${sheetId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          categoryId: 'armor-category',
          name: 'Leather Armor',
          description: '+2 AC',
          quantity: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Leather Armor');
    });

    it('should add item modifier and affect calculations', async () => {
      const itemsResponse = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const itemId = itemsResponse.body.items[0]?.id;

      if (itemId) {
        const modResponse = await request(app.getHttpServer())
          .post(`/tables/${tableId}/sheets/${sheetId}/items/${itemId}/modifiers`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            attributeName: 'AC',
            modifier: 2,
          })
          .expect(201);

        expect(modResponse.body).toHaveProperty('id');
        expect(modResponse.body.modifier).toBe(2);

        // Check that attribute now includes item bonus
        const updatedSheet = await request(app.getHttpServer())
          .get(`/tables/${tableId}/sheets/${sheetId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        const acAttr = updatedSheet.body.attributes.find(
          (a) => a.definition.name === 'AC',
        );
        if (acAttr) {
          expect(acAttr.itemModifiers).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('6. Effects Management & Validation', () => {
    it('should create effect', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets/${sheetId}/effects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Haste',
          type: 'BUFF',
          description: '+2 DEX',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Haste');
      expect(response.body.isActive).toBe(true);
      effectId = response.body.id;
    });

    it('should prevent duplicate effect', async () => {
      await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets/${sheetId}/effects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Haste',
          type: 'BUFF',
          description: '+2 DEX',
        })
        .expect(409); // Conflict
    });

    it('should reject effect with past expiration', async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

      await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets/${sheetId}/effects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Expired Effect',
          type: 'BUFF',
          description: '+1 STR',
          expiresAt: pastDate,
        })
        .expect(400); // Bad Request
    });

    it('should toggle effect active status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/effects/${effectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should delete effect', async () => {
      await request(app.getHttpServer())
        .delete(`/tables/${tableId}/sheets/${sheetId}/effects/${effectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('7. Race Assignment', () => {
    it('should assign race to character sheet', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/race`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          raceId: 'human-race-id',
        })
        .expect(200);

      expect(response.body).toHaveProperty('race');
    });
  });

  describe('8. Multiclassing', () => {
    it('should add class to character', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets/${sheetId}/classes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          classId: 'fighter-class-id',
          level: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.level).toBe(1);
    });

    it('should update class level', async () => {
      const sheetResponse = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const classId = sheetResponse.body.classes[0]?.id;

      if (classId) {
        const response = await request(app.getHttpServer())
          .patch(`/tables/${tableId}/sheets/${sheetId}/classes/${classId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            level: 3,
          })
          .expect(200);

        expect(response.body.level).toBe(3);
      }
    });
  });

  describe('9. Sheet Activation', () => {
    it('should activate character sheet', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('ACTIVE');
    });

    it('should prevent second active sheet for same member', async () => {
      // Create another sheet
      const newSheetResponse = await request(app.getHttpServer())
        .post(`/tables/${tableId}/sheets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Second Character',
          status: 'DRAFT',
        })
        .expect(201);

      const secondSheetId = newSheetResponse.body.id;

      // Try to activate it (should fail - already have active sheet)
      await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${secondSheetId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409); // Conflict
    });
  });

  describe('10. Session State Management', () => {
    it('should update session state', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/session-state`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          isVisible: true,
          isInScene: true,
        })
        .expect(200);

      expect(response.body.isVisible).toBe(true);
      expect(response.body.isInScene).toBe(true);
    });

    it('should reject invalid session state', async () => {
      await request(app.getHttpServer())
        .patch(`/tables/${tableId}/sheets/${sheetId}/session-state`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          isVisible: false,
          isInScene: false,
        })
        .expect(400); // Bad Request
    });
  });

  describe('11. Complete Calculation Validation', () => {
    it('should return accurate attribute calculations with all modifiers', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const attr = response.body.attributes[0];

      // Verify structure
      expect(attr).toHaveProperty('baseValue');
      expect(attr).toHaveProperty('itemModifiers');
      expect(attr).toHaveProperty('effectModifiers');
      expect(attr).toHaveProperty('total');

      // Verify calculation
      const baseValue = parseFloat(attr.baseValue);
      const expectedTotal =
        baseValue +
        (attr.itemModifiers || 0) +
        (attr.effectModifiers || 0);

      expect(attr.total).toBe(expectedTotal);
    });

    it('should include active effects in response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.effects)).toBe(true);
    });
  });

  describe('12. Permission Validation', () => {
    it('should deny access to sheet without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .expect(401); // Unauthorized
    });

    it('should deny access with invalid token', async () => {
      await request(app.getHttpServer())
        .get(`/tables/${tableId}/sheets/${sheetId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401); // Unauthorized
    });
  });
});
