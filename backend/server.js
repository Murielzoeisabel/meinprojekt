const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const createCatsRouter = require('./routes/cats');
const prisma = require('./prisma/client');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '8mb' }));

const COMMUNITY_DATA_PATH = path.join(__dirname, 'data', 'community.json');
const CAT_STATE_PATH = path.join(__dirname, 'data', 'cats-state.json');

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

const DEFAULT_CAT_STATE = {
  cats: [],
  weightHistory: {},
  calorieHistory: {}
};

const ensureDataDir = () => {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
};

const writeCatState = (state) => {
  ensureDataDir();
  fs.writeFileSync(CAT_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
};

const readCatState = () => {
  try {
    if (!fs.existsSync(CAT_STATE_PATH)) {
      writeCatState(DEFAULT_CAT_STATE);
      return { ...DEFAULT_CAT_STATE };
    }

    const raw = fs.readFileSync(CAT_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.cats) || typeof parsed.weightHistory !== 'object' || typeof parsed.calorieHistory !== 'object') {
      writeCatState(DEFAULT_CAT_STATE);
      return { ...DEFAULT_CAT_STATE };
    }

    return {
      cats: Array.isArray(parsed.cats) ? parsed.cats : [],
      weightHistory: parsed.weightHistory || {},
      calorieHistory: parsed.calorieHistory || {}
    };
  } catch (error) {
    console.error('Fehler beim Lesen der Katzen-Daten:', error);
    writeCatState(DEFAULT_CAT_STATE);
    return { ...DEFAULT_CAT_STATE };
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

const ALLOWED_CAT_FIELDS = new Set(['name', 'userId', 'age', 'breed', 'size', 'idealWeight', 'photo']);

const sendApiError = (res, status, code, message, details = undefined) => {
  const payload = {
    error: {
      code,
      message
    }
  };

  if (details !== undefined) {
    payload.error.details = details;
  }

  return res.status(status).json(payload);
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidCatPhoto = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  const trimmedValue = value.trim();
  return isValidHttpUrl(trimmedValue) || /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(trimmedValue);
};

const validateCatPayload = (payload, { requireName = true } = {}) => {
  if (!payload || typeof payload !== 'object') {
    return {
      code: 'INVALID_BODY',
      message: 'Ungültiger Request-Body. Erwartet wird ein JSON-Objekt.'
    };
  }

  const unknownFields = Object.keys(payload).filter((key) => !ALLOWED_CAT_FIELDS.has(key));
  if (unknownFields.length > 0) {
    return {
      code: 'UNKNOWN_FIELDS',
      message: 'Unbekannte Felder im Request-Body.',
      details: { fields: unknownFields }
    };
  }

  if (payload.name !== undefined && (typeof payload.name !== 'string' || !payload.name.trim())) {
    return {
      code: 'NAME_REQUIRED',
      message: 'Feld "name" ist erforderlich und darf nicht leer sein.',
      details: { field: 'name' }
    };
  }

  if (requireName && payload.name === undefined) {
    return {
      code: 'NAME_REQUIRED',
      message: 'Feld "name" ist erforderlich und darf nicht leer sein.',
      details: { field: 'name' }
    };
  }

  if (typeof payload.name === 'string' && payload.name.trim().length > 60) {
    return {
      code: 'NAME_TOO_LONG',
      message: 'Feld "name" darf maximal 60 Zeichen enthalten.',
      details: { field: 'name', maxLength: 60 }
    };
  }

  if (payload.userId !== undefined && parsePositiveInt(payload.userId) === null) {
    return {
      code: 'INVALID_USER_ID',
      message: 'Feld "userId" muss eine positive Ganzzahl sein.',
      details: { field: 'userId' }
    };
  }

  if (payload.age !== undefined) {
    const age = Number(payload.age);
    if (!Number.isInteger(age) || age < 0 || age > 40) {
      return {
        code: 'INVALID_AGE',
        message: 'Feld "age" muss eine ganze Zahl zwischen 0 und 40 sein.',
        details: { field: 'age', min: 0, max: 40 }
      };
    }
  }

  if (payload.breed !== undefined && (typeof payload.breed !== 'string' || !payload.breed.trim())) {
    return {
      code: 'INVALID_BREED',
      message: 'Feld "breed" muss ein nicht-leerer String sein.',
      details: { field: 'breed' }
    };
  }

  if (payload.size !== undefined && !['klein', 'mittel', 'gross'].includes(payload.size)) {
    return {
      code: 'INVALID_SIZE',
      message: 'Feld "size" muss einer der Werte "klein", "mittel" oder "gross" sein.',
      details: { field: 'size', allowedValues: ['klein', 'mittel', 'gross'] }
    };
  }

  if (payload.idealWeight !== undefined && payload.idealWeight !== '') {
    const idealWeight = Number(payload.idealWeight);
    if (Number.isNaN(idealWeight) || idealWeight <= 0 || idealWeight > 20) {
      return {
        code: 'INVALID_IDEAL_WEIGHT',
        message: 'Feld "idealWeight" muss eine positive Zahl kleiner/gleich 20 sein.',
        details: { field: 'idealWeight', minExclusive: 0, max: 20 }
      };
    }
  }

  if (payload.photo !== undefined && payload.photo !== '' && typeof payload.photo !== 'string') {
    return {
      code: 'INVALID_PHOTO_TYPE',
      message: 'Feld "photo" muss ein String sein.',
      details: { field: 'photo' }
    };
  }

  if (payload.photo !== undefined && typeof payload.photo === 'string' && payload.photo.length > 6000000) {
    return {
      code: 'PHOTO_URL_TOO_LONG',
      message: 'Feld "photo" darf maximal 6.000.000 Zeichen enthalten.',
      details: { field: 'photo', maxLength: 6000000 }
    };
  }

  if (payload.photo !== undefined && payload.photo !== '' && !isValidCatPhoto(payload.photo)) {
    return {
      code: 'INVALID_PHOTO_URL',
      message: 'Feld "photo" muss eine gültige http/https URL oder ein Data-Image sein.',
      details: { field: 'photo' }
    };
  }

  if (payload.userId === null) {
    return {
      code: 'INVALID_USER_ID',
      message: 'Feld "userId" darf nicht null sein.',
      details: { field: 'userId' }
    };
  }

  if (typeof payload.name === 'string' && payload.name.trim().length < 2) {
    return {
      code: 'NAME_TOO_SHORT',
      message: 'Feld "name" muss mindestens 2 Zeichen enthalten.',
      details: { field: 'name', minLength: 2 }
    };
  }

  return null;
};

const communityData = readCommunityData();
let communityPosts = [...communityData.posts];
let communityMessages = [...communityData.messages];

app.use('/api/cats', createCatsRouter({
  parsePositiveInt,
  sendApiError,
  validateCatPayload,
  getSuggestedIdealWeight
}));

// --- API ROUTES: WEIGHTS ---
app.get('/api/weights/:catId', async (req, res) => {
  try {
    const catId = parsePositiveInt(req.params.catId);
    if (catId === null) {
      return res.status(400).json({ error: 'Ungueltige Cat-ID.' });
    }

    const cat = await prisma.cat.findUnique({ where: { id: catId }, select: { id: true } });
    if (!cat) {
      return res.status(404).json({ error: 'Cat nicht gefunden.' });
    }

    const entries = await prisma.weightEntry.findMany({
      where: { catId },
      orderBy: { date: 'asc' }
    });

    return res.json(entries.map((entry) => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      weight: entry.weight
    })));
  } catch (error) {
    console.error('Fehler beim Laden der Gewichte:', error);
    return res.status(500).json({ error: 'Gewichte konnten nicht geladen werden.' });
  }
});

app.post('/api/weights', async (req, res) => {
  try {
    const { catId, weight, date } = req.body;
    const id = parsePositiveInt(catId);
    const parsedWeight = Number(weight);

    if (id === null) {
      return res.status(400).json({ error: 'Ungueltige Cat-ID.' });
    }

    const cat = await prisma.cat.findUnique({ where: { id }, select: { id: true } });
    if (!cat) {
      return res.status(404).json({ error: 'Cat nicht gefunden.' });
    }

    if (Number.isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 25) {
      return res.status(400).json({ error: 'Ungültiges Gewicht.' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const parsedDate = new Date(`${targetDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Ungueltiges Datum.' });
    }

    await prisma.weightEntry.upsert({
      where: {
        catId_date: {
          catId: id,
          date: parsedDate
        }
      },
      create: {
        catId: id,
        date: parsedDate,
        weight: parsedWeight
      },
      update: {
        weight: parsedWeight
      }
    });

    const entries = await prisma.weightEntry.findMany({
      where: { catId: id },
      orderBy: { date: 'asc' }
    });

    return res.status(201).json(entries.map((entry) => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      weight: entry.weight
    })));
  } catch (error) {
    console.error('Fehler beim Speichern des Gewichts:', error);
    return res.status(500).json({ error: 'Gewicht konnte nicht gespeichert werden.' });
  }
});

// --- API ROUTES: CALORIES ---
app.get('/api/calories/:catId', async (req, res) => {
  try {
    const catId = parsePositiveInt(req.params.catId);
    if (catId === null) {
      return res.status(400).json({ error: 'Ungueltige Cat-ID.' });
    }

    const cat = await prisma.cat.findUnique({ where: { id: catId }, select: { id: true } });
    if (!cat) {
      return res.status(404).json({ error: 'Cat nicht gefunden.' });
    }

    const entries = await prisma.calorieEntry.findMany({
      where: { catId },
      orderBy: { date: 'asc' }
    });

    return res.json(entries.map((entry) => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      consumed: entry.consumed,
      burned: entry.burned,
      basalBurned: entry.basalBurned
    })));
  } catch (error) {
    console.error('Fehler beim Laden der Kalorien:', error);
    return res.status(500).json({ error: 'Kalorien konnten nicht geladen werden.' });
  }
});

app.post('/api/calories', async (req, res) => {
  try {
    const { catId, consumed, burned, basalBurned, date } = req.body;
    const id = parsePositiveInt(catId);
    const parsedConsumed = consumed === undefined || consumed === '' ? 0 : parseFloat(consumed);
    const parsedBurned = burned === undefined || burned === '' ? 0 : parseFloat(burned);
    const parsedBasalBurned = basalBurned === undefined || basalBurned === '' ? 0 : parseFloat(basalBurned);

    if (id === null) {
      return res.status(400).json({ error: 'Ungueltige Cat-ID.' });
    }

    const cat = await prisma.cat.findUnique({ where: { id }, select: { id: true } });
    if (!cat) {
      return res.status(404).json({ error: 'Cat nicht gefunden.' });
    }

    if ([parsedConsumed, parsedBurned, parsedBasalBurned].some((value) => Number.isNaN(value) || value < 0)) {
      return res.status(400).json({ error: 'Ungültige Kalorienwerte.' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const parsedDate = new Date(`${targetDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Ungueltiges Datum.' });
    }

    const existing = await prisma.calorieEntry.findUnique({
      where: {
        catId_date: {
          catId: id,
          date: parsedDate
        }
      }
    });

    if (existing) {
      await prisma.calorieEntry.update({
        where: {
          catId_date: {
            catId: id,
            date: parsedDate
          }
        },
        data: {
          consumed: consumed !== undefined ? existing.consumed + parsedConsumed : existing.consumed,
          burned: burned !== undefined ? existing.burned + parsedBurned : existing.burned,
          basalBurned: basalBurned !== undefined ? parsedBasalBurned : existing.basalBurned
        }
      });
    } else {
      await prisma.calorieEntry.create({
        data: {
          catId: id,
          date: parsedDate,
          consumed: parsedConsumed,
          burned: parsedBurned,
          basalBurned: parsedBasalBurned
        }
      });
    }

    const entries = await prisma.calorieEntry.findMany({
      where: { catId: id },
      orderBy: { date: 'asc' }
    });

    return res.status(201).json(entries.map((entry) => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      consumed: entry.consumed,
      burned: entry.burned,
      basalBurned: entry.basalBurned
    })));
  } catch (error) {
    console.error('Fehler beim Speichern der Kalorien:', error);
    return res.status(500).json({ error: 'Kalorien konnten nicht gespeichert werden.' });
  }
});

// --- API ROUTES: COMMUNITY ---
app.get('/api/community/posts', async (req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.json(posts.map((post) => ({
      ...post,
      gefaelltMir: post.likes,
      daumenHoch: post.hearts
    })));
  } catch (error) {
    console.error('Fehler beim Laden der Community-Posts:', error);
    return res.status(500).json({ error: 'Community-Posts konnten nicht geladen werden.' });
  }
});

app.post('/api/community/posts', async (req, res) => {
  try {
    const { author, text, photo, beforeWeight, nowWeight } = req.body;

    if (!author || !String(author).trim() || !text || !String(text).trim()) {
      return res.status(400).json({ error: 'Autor und Text sind erforderlich.' });
    }

    const parsedBeforeWeight = Number.parseFloat(beforeWeight);
    const parsedNowWeight = Number.parseFloat(nowWeight);

    const createdPost = await prisma.communityPost.create({
      data: {
        author: String(author).trim(),
        text: String(text).trim(),
        photo: photo && String(photo).trim()
          ? String(photo).trim()
          : 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
        beforeWeight: Number.isNaN(parsedBeforeWeight) ? null : parsedBeforeWeight,
        nowWeight: Number.isNaN(parsedNowWeight) ? null : parsedNowWeight,
        likes: 0,
        hearts: 0
      }
    });

    return res.status(201).json({
      ...createdPost,
      gefaelltMir: createdPost.likes,
      daumenHoch: createdPost.hearts
    });
  } catch (error) {
    console.error('Fehler beim Erstellen eines Community-Posts:', error);
    return res.status(500).json({ error: 'Beitrag konnte nicht erstellt werden.' });
  }
});

app.delete('/api/community/posts/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Ungueltige Post-ID.' });
    }

    const existing = await prisma.communityPost.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({ error: 'Post nicht gefunden.' });
    }

    await prisma.communityPost.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Loeschen eines Community-Posts:', error);
    return res.status(500).json({ error: 'Post konnte nicht geloescht werden.' });
  }
});

app.post('/api/community/posts/:id/reactions', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    const { type } = req.body;

    if (id === null) {
      return res.status(400).json({ error: 'Ungueltige Post-ID.' });
    }

    if (type !== 'like' && type !== 'thumbsUp') {
      return res.status(400).json({ error: 'Ungültiger Reaktionstyp.' });
    }

    const existing = await prisma.communityPost.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({ error: 'Post nicht gefunden.' });
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id },
      data: type === 'like'
        ? { likes: { increment: 1 } }
        : { hearts: { increment: 1 } }
    });

    return res.json({
      ...updatedPost,
      gefaelltMir: updatedPost.likes,
      daumenHoch: updatedPost.hearts
    });
  } catch (error) {
    console.error('Fehler beim Speichern einer Reaktion:', error);
    return res.status(500).json({ error: 'Reaktion konnte nicht gespeichert werden.' });
  }
});

app.get('/api/community/messages', async (req, res) => {
  try {
    const messages = await prisma.communityMessage.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return res.json(messages.map((message) => ({
      id: message.id,
      user: message.userName,
      avatar: message.avatar,
      text: message.text,
      createdAt: message.createdAt
    })));
  } catch (error) {
    console.error('Fehler beim Laden der Community-Nachrichten:', error);
    return res.status(500).json({ error: 'Nachrichten konnten nicht geladen werden.' });
  }
});

app.post('/api/community/messages', async (req, res) => {
  try {
    const { user, text, avatar } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Nachrichtentext ist erforderlich.' });
    }

    const createdMessage = await prisma.communityMessage.create({
      data: {
        userName: user && String(user).trim() ? String(user).trim() : 'Du',
        avatar: avatar && String(avatar).trim() ? String(avatar).trim() : null,
        text: String(text).trim()
      }
    });

    const messagePayload = {
      id: createdMessage.id,
      user: createdMessage.userName,
      avatar: createdMessage.avatar,
      text: createdMessage.text,
      createdAt: createdMessage.createdAt
    };

    return res.status(201).json(messagePayload);
  } catch (error) {
    console.error('Fehler beim Erstellen einer Community-Nachricht:', error);
    return res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden.' });
  }
});

app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    return sendApiError(
      res,
      413,
      'REQUEST_TOO_LARGE',
      'Die Anfrage ist zu groß. Bitte nutze ein kleineres Bild (empfohlen: maximal 3 MB).',
      { limit: '8mb' }
    );
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendApiError(res, 400, 'INVALID_JSON', 'Ungültiges JSON im Request-Body.');
  }

  console.error('Unerwarteter Serverfehler:', err);
  return sendApiError(res, 500, 'INTERNAL_SERVER_ERROR', 'Interner Serverfehler.');
});

app.listen(PORT, () => console.log(`✓ Backend läuft auf http://localhost:${PORT}`));