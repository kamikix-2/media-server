import express from 'express';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 8084);
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const stateKeys = ['profiles', 'candidaturas', 'offers'];

app.use(express.json({ limit: '50mb' }));

function isValidState(state) {
  return state &&
    stateKeys.every((key) => Array.isArray(state[key])) &&
    typeof state.activeProfileId === 'string';
}

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.sendStatus(204);
  } catch {
    response.sendStatus(503);
  }
});

app.get('/api/state', async (_request, response, next) => {
  try {
    const result = await pool.query(
      'SELECT state FROM cv_manager_state WHERE singleton = TRUE'
    );
    response.json({ state: result.rows[0]?.state ?? null });
  } catch (error) {
    next(error);
  }
});

app.post('/api/state/initialize', async (request, response, next) => {
  const state = request.body?.state;
  if (!isValidState(state)) {
    response.status(400).json({ error: 'Invalid application state.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO cv_manager_state (singleton, state)
       VALUES (TRUE, $1::jsonb)
       ON CONFLICT (singleton) DO NOTHING
       RETURNING state`,
      [JSON.stringify(state)]
    );
    const result = inserted.rowCount
      ? inserted
      : await client.query(
          'SELECT state FROM cv_manager_state WHERE singleton = TRUE'
        );
    await client.query('COMMIT');
    response.json({ state: result.rows[0].state });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

app.put('/api/state', async (request, response, next) => {
  const state = request.body?.state;
  if (!isValidState(state)) {
    response.status(400).json({ error: 'Invalid application state.' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO cv_manager_state (singleton, state, updated_at)
       VALUES (TRUE, $1::jsonb, NOW())
       ON CONFLICT (singleton) DO UPDATE
       SET state = EXCLUDED.state, updated_at = NOW()
       RETURNING state`,
      [JSON.stringify(state)]
    );
    response.json({ state: result.rows[0].state });
  } catch (error) {
    next(error);
  }
});

app.use('/api', (_request, response) => {
  response.sendStatus(404);
});

app.use(express.static(path.join(appDirectory, 'dist')));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(appDirectory, 'dist', 'index.html'));
});

app.use((error, _request, response, _next) => {
  console.error('Request failed:', error);
  response.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cv_manager_state (
      singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  app.listen(port, '0.0.0.0', () => {
    console.log(`CV Manager API and web server listening on ${port}`);
  });
}

start().catch((error) => {
  console.error('Could not initialize PostgreSQL:', error);
  process.exit(1);
});