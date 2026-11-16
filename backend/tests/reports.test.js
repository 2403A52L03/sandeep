const request = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/config/db');

let adminToken = '';

describe('Mandatory Reports & Analytics Test Suite', () => {
  beforeAll(async () => {
    await initDb();
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@smartagri.edu', password: 'Password@123' });
    adminToken = adminRes.body.data.token;
  });

  describe('Report A: Crop-wise Monitoring Report', () => {
    it('GET /api/reports/crop-monitoring should return monitoring metrics and growth stats', async () => {
      const res = await request(app)
        .get('/api/reports/crop-monitoring')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const row = res.body.data[0];
      expect(row).toHaveProperty('crop_name');
      expect(row).toHaveProperty('farm_name');
      expect(row).toHaveProperty('plot_name');
      expect(row).toHaveProperty('growth_progress');
      expect(row).toHaveProperty('latest_soil_moisture');
      expect(row).toHaveProperty('latest_temperature');
    });
  });

  describe('Report B: Farm Activities Report', () => {
    it('GET /api/reports/farm-activities should aggregate cost and labor hours', async () => {
      const res = await request(app)
        .get('/api/reports/farm-activities')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toHaveProperty('total_cost');
      expect(res.body.meta).toHaveProperty('total_labour_hours');
      expect(res.body.meta.total_cost).toBeGreaterThan(0);
    });
  });

  describe('Report C: Irrigation Report', () => {
    it('GET /api/reports/irrigation should return water consumption aggregates', async () => {
      const res = await request(app)
        .get('/api/reports/irrigation')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toHaveProperty('total_water_litres');
      expect(res.body.meta.total_water_litres).toBeGreaterThan(0);
    });
  });

  describe('Report D: Yield / Production Report', () => {
    it('GET /api/reports/yield should calculate production variance (Actual - Expected)', async () => {
      const res = await request(app)
        .get('/api/reports/yield')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toHaveProperty('total_expected_yield');
      expect(res.body.meta).toHaveProperty('total_actual_yield');
      expect(res.body.meta).toHaveProperty('net_variance');
    });
  });
});

