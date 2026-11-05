const request = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/config/db');

let adminToken = '';
let farmerToken = '';

describe('Farm & Plot Management Test Suite', () => {
  beforeAll(async () => {
    await initDb();

    // Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@smartagri.edu', password: 'Password@123' });
    adminToken = adminRes.body.data.token;

    // Authenticate Farmer
    const farmerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'farmer@smartagri.edu', password: 'Password@123' });
    farmerToken = farmerRes.body.data.token;
  });

  describe('GET /api/farms', () => {
    it('Admin should be able to view all farms', async () => {
      const res = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Farmer should be restricted to their own farms', async () => {
      const res = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach(farm => {
        expect(farm.owner_id).toBe(2);
      });
    });
  });

  describe('POST /api/farms', () => {
    it('Farmer should be able to register a new farm', async () => {
      const res = await request(app)
        .post('/api/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Green Horizon Farm',
          total_area: 12.5,
          area_unit: 'Acres',
          soil_type: 'Black Clay Loam',
          location: 'Warangal Suburbs',
          district: 'Hanamkonda',
          state: 'Telangana'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Green Horizon Farm');
    });

    it('should reject farm registration with invalid negative area', async () => {
      const res = await request(app)
        .post('/api/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Invalid Farm',
          total_area: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/plots', () => {
    it('should prevent plot area from exceeding available farm area', async () => {
      // Farm 1 total area is 15.5 Acres, already has plots totaling 15.5 Acres
      const res = await request(app)
        .post('/api/plots')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm_id: 1,
          name: 'Over-capacity Plot',
          area: 50.0, // Exceeds farm limit
          soil_type: 'Red Loam'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds available farm area');
    });
  });
});
