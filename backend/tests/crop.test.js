const request = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/config/db');

let farmerToken = '';

describe('Crop Management & Lifecycle Calculations Test Suite', () => {
  beforeAll(async () => {
    await initDb();
    const farmerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'farmer@smartagri.edu', password: 'Password@123' });
    farmerToken = farmerRes.body.data.token;
  });

  describe('GET /api/crops', () => {
    it('should return crops with dynamic growth progress and harvest calculation fields', async () => {
      const res = await request(app)
        .get('/api/crops')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstCrop = res.body.data[0];
      expect(firstCrop).toHaveProperty('growth_progress_percentage');
      expect(firstCrop).toHaveProperty('days_until_harvest');
      expect(firstCrop).toHaveProperty('is_overdue');
      expect(firstCrop).toHaveProperty('harvest_status_label');
      expect(typeof firstCrop.growth_progress_percentage).toBe('number');
      expect(firstCrop.growth_progress_percentage).toBeGreaterThanOrEqual(0);
      expect(firstCrop.growth_progress_percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /api/crops', () => {
    it('should register a new crop with valid planting and harvest dates', async () => {
      const res = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          plot_id: 1,
          crop_name: 'Organic Wheat',
          crop_category: 'Cereals',
          variety: 'HD 2967',
          planting_date: '2026-11-01',
          expected_harvest_date: '2027-03-15',
          cultivated_area: 2.5,
          expected_yield: 40,
          yield_unit: 'Quintals',
          status: 'Planted'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.crop_name).toBe('Organic Wheat');
      expect(res.body.data.growth_progress_percentage).toBeDefined();
    });

    it('should reject harvest date prior to planting date', async () => {
      const res = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          plot_id: 1,
          crop_name: 'Invalid Crop',
          planting_date: '2026-11-01',
          expected_harvest_date: '2026-10-01', // Earlier than planting date
          cultivated_area: 2.0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
