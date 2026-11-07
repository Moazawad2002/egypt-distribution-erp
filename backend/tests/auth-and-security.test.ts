import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication & Branch-Level Authorization Security', () => {
  let ceoToken: string;
  let cairoManagerToken: string;
  let alexManagerToken: string;

  beforeAll(async () => {
    // 1. Authenticate CEO
    const ceoRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ceo', password: 'Password123!' });
    expect(ceoRes.status).toBe(200);
    expect(ceoRes.body.data.token).toBeDefined();
    ceoToken = ceoRes.body.data.token;

    // 2. Authenticate Cairo Branch Manager
    const cairoRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'manager.cairo', password: 'Password123!' });
    expect(cairoRes.status).toBe(200);
    cairoManagerToken = cairoRes.body.data.token;

    // 3. Authenticate Alexandria Branch Manager
    const alexRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'manager.alex', password: 'Password123!' });
    expect(alexRes.status).toBe(200);
    alexManagerToken = alexRes.body.data.token;
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/sales/invoices');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('allows CEO to access consolidated data across all branches', async () => {
    const res = await request(app)
      .get('/api/analytics/ceo-overview')
      .set('Authorization', `Bearer ${ceoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.branchBreakdown.length).toBe(3); // Cairo, Alex, Mansoura
  });

  it('enforces that Cairo Manager only sees Cairo data and cannot access Alexandria data', async () => {
    // Attempt to access Alexandria invoices using Cairo Manager token
    const res = await request(app)
      .get('/api/sales/invoices?branchId=branch-alx-02')
      .set('Authorization', `Bearer ${cairoManagerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access Denied');
  });

  it('rejects cross-branch invoice creation by a branch manager', async () => {
    const res = await request(app)
      .post('/api/sales/invoices')
      .set('Authorization', `Bearer ${cairoManagerToken}`)
      .send({
        branchId: 'branch-alx-02', // Trying to create in Alexandria branch!
        customerId: 'cust-alx-01',
        salesRepresentativeId: 'rep-alx-01',
        dueDate: '2026-11-20',
        lines: [{ productId: 'prod-oil-01', quantity: 10, unitPrice: 890 }]
      });

    expect(res.status).toBe(403);
  });

  it('allows Cairo Manager to access their authorized Cairo branch data', async () => {
    const res = await request(app)
      .get('/api/sales/invoices')
      .set('Authorization', `Bearer ${cairoManagerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // All returned invoices must belong strictly to Cairo branch
    for (const inv of res.body.data) {
      expect(inv.branchId).toBe('branch-cai-01');
    }
  });
});
