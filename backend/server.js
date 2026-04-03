const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory Daten
let cats = [
  { id: 1, name: 'Luna', age: 3, idealWeight: 5.0, photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
  { id: 2, name: 'Milo', age: 2, idealWeight: 4.5, photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400' }
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
    { date: '2026-03-25', consumed: 220, burned: 50 },
    { date: '2026-03-26', consumed: 215, burned: 60 }
  ],
  2: [
    { date: '2026-03-26', consumed: 200, burned: 45 }
  ]
};

// --- API ROUTES: CATS ---
app.get('/api/cats', (req, res) => {
  // Aktuelles Gewicht anhängen
  const catsWithWeight = cats.map(cat => {
    const history = weightHistory[cat.id] || [];
    const currentWeight = history.length > 0 ? history[history.length - 1].weight : null;
    return { ...cat, currentWeight };
  });
  res.json(catsWithWeight);
});

app.post('/api/cats', (req, res) => {
  const { name, age, idealWeight, photo } = req.body;
  const newCat = {
    id: cats.length > 0 ? Math.max(...cats.map(c => c.id)) + 1 : 1,
    name,
    age: parseInt(age),
    idealWeight: parseFloat(idealWeight),
    photo: photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
  };
  cats.push(newCat);
  weightHistory[newCat.id] = [];
  calorieHistory[newCat.id] = [];
  res.status(201).json(newCat);
});

app.delete('/api/cats/:id', (req, res) => {
  const id = parseInt(req.params.id);
  cats = cats.filter(c => c.id !== id);
  delete weightHistory[id];
  delete calorieHistory[id];
  res.json({ success: true });
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
  const { catId, consumed, burned, date } = req.body;
  const id = parseInt(catId);
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  if (!calorieHistory[id]) calorieHistory[id] = [];
  
  // Vorhandenen Eintrag überschreiben/ergänzen falls Datum übereinstimmt, ansonsten neu
  const existing = calorieHistory[id].find(entry => entry.date === targetDate);
  if (existing) {
    if (consumed !== undefined) existing.consumed += parseFloat(consumed);
    if (burned !== undefined) existing.burned += parseFloat(burned);
  } else {
    calorieHistory[id].push({
      date: targetDate,
      consumed: parseFloat(consumed || 0),
      burned: parseFloat(burned || 0)
    });
  }
  
  calorieHistory[id].sort((a, b) => new Date(a.date) - new Date(b.date));
  res.status(201).json(calorieHistory[id]);
});

app.listen(PORT, () => console.log(`✓ Backend läuft auf http://localhost:${PORT}`));