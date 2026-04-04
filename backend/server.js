const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const COMMUNITY_DATA_PATH = path.join(__dirname, 'data', 'community.json');

const DEFAULT_COMMUNITY_DATA = {
  posts: [
    {
      id: 1,
      author: 'Mia & Muffin',
      beforeWeight: 6.4,
      nowWeight: 5.7,
      text: 'Woche 6 geschafft. Mehr Spielzeit am Abend hat bei uns super geholfen.',
      photo: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1200&q=80',
      likes: 14,
      hearts: 9,
      createdAt: '2026-03-28T09:15:00.000Z'
    },
    {
      id: 2,
      author: 'Luca & Nala',
      beforeWeight: 5.9,
      nowWeight: 5.2,
      text: 'Wir nutzen den Kalorientracker jeden Tag. Kleine Schritte, großer Effekt.',
      photo: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80',
      likes: 11,
      hearts: 12,
      createdAt: '2026-03-29T14:20:00.000Z'
    },
    {
      id: 3,
      author: 'Sara & Oskar',
      beforeWeight: 7.0,
      nowWeight: 6.3,
      text: 'Laser-Workout und Futterplan haben Oskar richtig mobil gemacht.',
      photo: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
      likes: 17,
      hearts: 15,
      createdAt: '2026-03-30T17:30:00.000Z'
    }
  ],
  messages: [
    { id: 1, user: 'Mia', text: 'Hat jemand gute Indoor-Ideen für Regentage?', createdAt: '2026-03-31T08:00:00.000Z' },
    { id: 2, user: 'Luca', text: 'Wir machen 3x 10 Minuten Jagdspiele, klappt top.', createdAt: '2026-03-31T08:04:00.000Z' },
    { id: 3, user: 'Sara', text: 'Snack-Ball ist auch super fürs langsamere Fressen.', createdAt: '2026-03-31T08:08:00.000Z' }
  ]
};

const ensureCommunityDataDir = () => {
  fs.mkdirSync(path.dirname(COMMUNITY_DATA_PATH), { recursive: true });
};

const writeCommunityData = (data) => {
  ensureCommunityDataDir();
  fs.writeFileSync(COMMUNITY_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const readCommunityData = () => {
  try {
    if (!fs.existsSync(COMMUNITY_DATA_PATH)) {
      writeCommunityData(DEFAULT_COMMUNITY_DATA);
      return { ...DEFAULT_COMMUNITY_DATA };
    }

    const raw = fs.readFileSync(COMMUNITY_DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.posts) || !Array.isArray(parsed.messages)) {
      writeCommunityData(DEFAULT_COMMUNITY_DATA);
      return { ...DEFAULT_COMMUNITY_DATA };
    }
    return parsed;
  } catch (error) {
    console.error('Fehler beim Lesen der Community-Daten:', error);
    writeCommunityData(DEFAULT_COMMUNITY_DATA);
    return { ...DEFAULT_COMMUNITY_DATA };
  }
};

const getNextId = (collection) => {
  if (!collection.length) return 1;
  return Math.max(...collection.map(item => Number(item.id) || 0)) + 1;
};

const BREED_BASE_WEIGHTS = {
  'Europäisch Kurzhaar': 4.2,
  'Britisch Kurzhaar': 5.0,
  'Siam': 3.8,
  'Maine Coon': 6.8,
  'Norwegische Waldkatze': 5.8,
  'Ragdoll': 5.5,
  'Mischling': 4.5
};

const SIZE_OFFSETS = {
  klein: -0.4,
  mittel: 0,
  gross: 0.5
};

const getSuggestedIdealWeight = (breed = 'Mischling', size = 'mittel') => {
  const base = BREED_BASE_WEIGHTS[breed] ?? BREED_BASE_WEIGHTS.Mischling;
  const offset = SIZE_OFFSETS[size] ?? 0;
  return Math.max(2.5, Number((base + offset).toFixed(1)));
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const validateCatPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Ungültiger Request-Body.';
  }

  if (typeof payload.name !== 'string' || !payload.name.trim()) {
    return 'Feld "name" ist erforderlich.';
  }

  if (payload.userId !== undefined && parsePositiveInt(payload.userId) === null) {
    return 'Feld "userId" muss eine positive Ganzzahl sein.';
  }

  if (payload.age !== undefined) {
    const age = Number(payload.age);
    if (Number.isNaN(age) || age < 0) {
      return 'Feld "age" muss eine nicht-negative Zahl sein.';
    }
  }

  if (payload.idealWeight !== undefined && payload.idealWeight !== '') {
    const idealWeight = Number(payload.idealWeight);
    if (Number.isNaN(idealWeight) || idealWeight <= 0) {
      return 'Feld "idealWeight" muss eine positive Zahl sein.';
    }
  }

  return null;
};

const withCurrentWeight = (cat) => {
  const history = weightHistory[cat.id] || [];
  const currentWeight = history.length > 0 ? history[history.length - 1].weight : null;
  return { ...cat, currentWeight };
};

// In-memory Daten
let cats = [
  { id: 1, name: 'Luna', userId: 1, age: 3, breed: 'Europäisch Kurzhaar', size: 'mittel', idealWeight: 5.0, photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
  { id: 2, name: 'Milo', userId: 2, age: 2, breed: 'Mischling', size: 'mittel', idealWeight: 4.5, photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400' }
];

let weightHistory = {
  1: [
    { date: '2026-03-01', weight: 5.3 },
    { date: '2026-03-10', weight: 5.1 },
    { date: '2026-03-25', weight: 5.0 }
  ],
  2: [
    { date: '2026-03-01', weight: 5.0 },
    { date: '2026-03-25', weight: 4.8 }
  ]
};

let calorieHistory = {
  1: [
    { date: '2026-03-25', consumed: 220, burned: 50, basalBurned: 185 },
    { date: '2026-03-26', consumed: 215, burned: 60, basalBurned: 185 }
  ],
  2: [
    { date: '2026-03-26', consumed: 200, burned: 45, basalBurned: 172 }
  ]
};

const communityData = readCommunityData();
let communityPosts = [...communityData.posts];
let communityMessages = [...communityData.messages];

// --- API ROUTES: CATS ---
app.get('/api/cats', (req, res) => {
  const { userId } = req.query;

  if (userId !== undefined) {
    const parsedUserId = parsePositiveInt(userId);
    if (parsedUserId === null) {
      return res.status(400).json({ error: 'Query-Parameter "userId" ist ungültig.' });
    }

    return res.json(cats.filter((cat) => cat.userId === parsedUserId).map(withCurrentWeight));
  }

  res.json(cats.map(withCurrentWeight));
});

app.get('/api/cats/:id', (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Ungültige Cat-ID.' });
  }

  const cat = cats.find((item) => item.id === id);
  if (!cat) {
    return res.status(404).json({ error: 'Cat nicht gefunden.' });
  }

  res.json(withCurrentWeight(cat));
});

app.post('/api/cats', (req, res) => {
  const validationError = validateCatPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedBreed = req.body.breed || 'Mischling';
  const normalizedSize = req.body.size || 'mittel';
  const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
    ? getSuggestedIdealWeight(normalizedBreed, normalizedSize)
    : parseFloat(req.body.idealWeight);
  const name = req.body.name.trim();

  const newCat = {
    id: cats.length > 0 ? Math.max(...cats.map(c => c.id)) + 1 : 1,
    userId: req.body.userId !== undefined ? Number(req.body.userId) : null,
    name,
    age: req.body.age !== undefined ? Number(req.body.age) : null,
    breed: normalizedBreed,
    size: normalizedSize,
    idealWeight: parsedIdealWeight,
    photo: req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
  };

  cats.push(newCat);
  weightHistory[newCat.id] = [];
  calorieHistory[newCat.id] = [];

  res.status(201).json(newCat);
});

app.put('/api/cats/:id', (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Ungültige Cat-ID.' });
  }

  const catIndex = cats.findIndex(cat => cat.id === id);

  if (catIndex === -1) {
    return res.status(404).json({ error: 'Cat nicht gefunden.' });
  }

  const validationError = validateCatPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const nextBreed = req.body.breed || 'Mischling';
  const nextSize = req.body.size || 'mittel';
  const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
    ? getSuggestedIdealWeight(nextBreed, nextSize)
    : parseFloat(req.body.idealWeight);

  cats[catIndex] = {
    id,
    userId: req.body.userId !== undefined ? Number(req.body.userId) : null,
    name: req.body.name.trim(),
    age: req.body.age !== undefined ? Number(req.body.age) : null,
    breed: nextBreed,
    size: nextSize,
    idealWeight: parsedIdealWeight,
    photo: req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${req.body.name.trim()}`
  };

  res.json(cats[catIndex]);
});

app.delete('/api/cats/:id', (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Ungültige Cat-ID.' });
  }

  const catExists = cats.some((cat) => cat.id === id);
  if (!catExists) {
    return res.status(404).json({ error: 'Cat nicht gefunden.' });
  }

  cats = cats.filter((c) => c.id !== id);
  delete weightHistory[id];
  delete calorieHistory[id];
  res.status(204).send();
});

// --- API ROUTES: WEIGHTS ---
app.get('/api/weights/:catId', (req, res) => {
  const catId = parseInt(req.params.catId);
  res.json(weightHistory[catId] || []);
});

app.post('/api/weights', (req, res) => {
  const { catId, weight, date } = req.body;
  const id = parseInt(catId);
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  if (!weightHistory[id]) weightHistory[id] = [];
  weightHistory[id].push({ date: targetDate, weight: parseFloat(weight) });
  
  // Chronologisch sortieren
  weightHistory[id].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.status(201).json(weightHistory[id]);
});

// --- API ROUTES: CALORIES ---
app.get('/api/calories/:catId', (req, res) => {
  const catId = parseInt(req.params.catId);
  res.json(calorieHistory[catId] || []);
});

app.post('/api/calories', (req, res) => {
  const { catId, consumed, burned, basalBurned, date } = req.body;
  const id = parseInt(catId);
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  if (!calorieHistory[id]) calorieHistory[id] = [];
  
  // Vorhandenen Eintrag überschreiben/ergänzen falls Datum übereinstimmt, ansonsten neu
  const existing = calorieHistory[id].find(entry => entry.date === targetDate);
  if (existing) {
    if (consumed !== undefined) existing.consumed += parseFloat(consumed);
    if (burned !== undefined) existing.burned += parseFloat(burned);
    if (basalBurned !== undefined) existing.basalBurned = parseFloat(basalBurned);
  } else {
    calorieHistory[id].push({
      date: targetDate,
      consumed: parseFloat(consumed || 0),
      burned: parseFloat(burned || 0),
      basalBurned: parseFloat(basalBurned || 0)
    });
  }
  
  calorieHistory[id].sort((a, b) => new Date(a.date) - new Date(b.date));
  res.status(201).json(calorieHistory[id]);
});

// --- API ROUTES: COMMUNITY ---
app.get('/api/community/posts', (req, res) => {
  const sortedPosts = [...communityPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedPosts);
});

app.post('/api/community/posts', (req, res) => {
  const { author, text, photo, beforeWeight, nowWeight } = req.body;

  if (!author || !String(author).trim() || !text || !String(text).trim()) {
    return res.status(400).json({ error: 'Autor und Text sind erforderlich.' });
  }

  const parsedBeforeWeight = Number.parseFloat(beforeWeight);
  const parsedNowWeight = Number.parseFloat(nowWeight);

  const post = {
    id: getNextId(communityPosts),
    author: String(author).trim(),
    text: String(text).trim(),
    photo: photo && String(photo).trim()
      ? String(photo).trim()
      : 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    beforeWeight: Number.isNaN(parsedBeforeWeight) ? null : parsedBeforeWeight,
    nowWeight: Number.isNaN(parsedNowWeight) ? null : parsedNowWeight,
    gefaelltMir: 0,
    daumenHoch: 0,
    createdAt: new Date().toISOString()
  };

  communityPosts.push(post);
  writeCommunityData({ posts: communityPosts, messages: communityMessages });

  res.status(201).json(post);
});

app.delete('/api/community/posts/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const beforeCount = communityPosts.length;
  communityPosts = communityPosts.filter(post => post.id !== id);

  if (communityPosts.length === beforeCount) {
    return res.status(404).json({ error: 'Post nicht gefunden.' });
  }

  writeCommunityData({ posts: communityPosts, messages: communityMessages });
  res.json({ success: true });
});

app.post('/api/community/posts/:id/reactions', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { type } = req.body;

  if (type !== 'like' && type !== 'thumbsUp') {
    return res.status(400).json({ error: 'Ungültiger Reaktionstyp.' });
  }

  const post = communityPosts.find(item => item.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post nicht gefunden.' });
  }

  // Backward compatibility for existing persisted data
  post.gefaelltMir = Number(post.gefaelltMir ?? post.likes ?? 0);
  post.daumenHoch = Number(post.daumenHoch ?? post.hearts ?? 0);

  if (type === 'like') {
    post.gefaelltMir += 1;
  } else {
    post.daumenHoch += 1;
  }

  writeCommunityData({ posts: communityPosts, messages: communityMessages });
  res.json(post);
});

app.get('/api/community/messages', (req, res) => {
  const sortedMessages = [...communityMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(sortedMessages);
});

app.post('/api/community/messages', (req, res) => {
  const { user, text } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Nachrichtentext ist erforderlich.' });
  }

  const message = {
    id: getNextId(communityMessages),
    user: user && String(user).trim() ? String(user).trim() : 'Du',
    text: String(text).trim(),
    createdAt: new Date().toISOString()
  };

  communityMessages.push(message);
  if (communityMessages.length > 500) {
    communityMessages = communityMessages.slice(-500);
  }

  writeCommunityData({ posts: communityPosts, messages: communityMessages });
  res.status(201).json(message);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Ungültiges JSON im Request-Body.' });
  }
  return next(err);
});

app.listen(PORT, () => console.log(`✓ Backend läuft auf http://localhost:${PORT}`));