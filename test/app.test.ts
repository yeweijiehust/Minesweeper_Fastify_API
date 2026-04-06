import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('buildApp', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond to /ping', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ping',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      message: 'Fastify API is running',
    });
  });

  it('should expose swagger json', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);

    const docs = response.json();
    expect(docs.openapi).toBeTruthy();
    expect(docs.info.title).toBe('Minesweeper Fastify API');

    const paths = Object.keys(docs.paths ?? {});
    expect(paths).toContain('/ping');
    expect(paths).toContain('/register');
    expect(paths).toContain('/login');
    expect(paths).toContain('/leaderboard');
    expect(paths).toContain('/economy');
    expect(paths).toContain('/inventory');
  });

  it('should reject invalid register payload by schema', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/register',
      payload: {
        username: '',
        password: '',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject missing leaderboard query parameter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/leaderboard',
    });

    expect(response.statusCode).toBe(400);
  });

  it('should block unauthorized access to protected routes', async () => {
    const economyResponse = await app.inject({
      method: 'GET',
      url: '/economy',
    });

    const inventoryResponse = await app.inject({
      method: 'POST',
      url: '/inventory',
      payload: {
        bombShield: 1,
      },
    });

    expect(economyResponse.statusCode).toBe(401);
    expect(inventoryResponse.statusCode).toBe(401);
  });
});
