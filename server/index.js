/**
 * Chats API server: store and load chat sessions as JSON files in a directory.
 * GET /chats - list all chats (id, title, createdAt)
 * GET /chats/:id - get one chat (full session)
 * POST /chats - create or update a chat (body: { id, title, createdAt, messages })
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHATS_DIR = process.env.CHATS_DIR || path.join(process.cwd(), 'chats');
const PORT = Number(process.env.CHATS_PORT) || 3080;

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function safeId(id) {
  return (id || '').replace(/[^a-zA-Z0-9-_]/g, '_');
}

function chatPath(id) {
  return path.join(CHATS_DIR, `${safeId(id)}.json`);
}

async function ensureChatsDir() {
  await fs.mkdir(CHATS_DIR, { recursive: true });
}

app.get('/chats', async (req, res) => {
  try {
    await ensureChatsDir();
    const files = await fs.readdir(CHATS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    const list = [];
    for (const f of jsonFiles) {
      try {
        const raw = await fs.readFile(path.join(CHATS_DIR, f), 'utf-8');
        const data = JSON.parse(raw);
        list.push({
          id: data.id || path.basename(f, '.json'),
          title: data.title || 'New chat',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Skip invalid chat file:', f, e.message);
      }
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (err) {
    console.error('GET /chats', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/chats/:id', async (req, res) => {
  try {
    const filePath = chatPath(req.params.id);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Chat not found' });
    console.error('GET /chats/:id', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/chats', async (req, res) => {
  try {
    const { id, title, createdAt, messages } = req.body || {};
    const sessionId = id || `session-${Date.now()}`;
    await ensureChatsDir();
    const payload = {
      id: sessionId,
      title: title || 'New chat',
      createdAt: createdAt || new Date().toISOString(),
      messages: Array.isArray(messages) ? messages : [],
    };
    const filePath = chatPath(sessionId);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    res.status(201).json(payload);
  } catch (err) {
    console.error('POST /chats', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/chats/:id', async (req, res) => {
  try {
    const filePath = chatPath(req.params.id);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const { title } = req.body || {};
    if (typeof title === 'string' && title.trim()) {
      data.title = title.trim();
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    res.json(data);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Chat not found' });
    console.error('PATCH /chats/:id', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/chats/:id', async (req, res) => {
  try {
    const filePath = chatPath(req.params.id);
    await fs.unlink(filePath);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(204).send();
    console.error('DELETE /chats/:id', err);
    res.status(500).json({ error: err.message });
  }
});

async function main() {
  await ensureChatsDir();
  app.listen(PORT, () => {
    console.log(`Chats API: http://localhost:${PORT}  (chats dir: ${CHATS_DIR})`);
  });
}

main().catch(console.error);
