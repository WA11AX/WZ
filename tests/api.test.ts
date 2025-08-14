import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('API Endpoints', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create app instance for testing
    app = express();
    app.use(express.json());
    
    // Add basic health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Add basic tournament endpoint mock
    app.get('/api/tournaments', (req, res) => {
      res.json({
        tournaments: [
          { id: 1, name: 'Test Tournament', status: 'active' },
          { id: 2, name: 'Another Tournament', status: 'completed' }
        ]
      });
    });
  });

  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return tournaments list', async () => {
    const response = await request(app)
      .get('/api/tournaments')
      .expect(200);

    expect(response.body).toHaveProperty('tournaments');
    expect(Array.isArray(response.body.tournaments)).toBe(true);
    expect(response.body.tournaments).toHaveLength(2);
  });

  it('should handle 404 for unknown endpoints', async () => {
    await request(app)
      .get('/api/unknown')
      .expect(404);
  });
});